import { supabase } from '../supabase';
import { db, type Moment } from './db';
import { networkStatusStore } from '../hooks/useNetworkStatus';
import { notificationService } from './notificationService';

export type StorageMode = 'local' | 'cloud';
type SyncStatus = 0 | 1; // 0 = pending/error, 1 = synced

interface SyncResult {
  success: boolean;
  syncedCount: number;
  errorCount: number;
  total: number;
  error?: string;
}

class SyncService {
  private isSyncing = false;
  private syncInterval: number | undefined;
  private currentUser: string | null = null;
  private storageMode: StorageMode = 'cloud';
  private lastSyncTime: string | null = null;

  async setUser(userId: string) {
    this.currentUser = userId;
    await this.loadPreferences();
  }

  async setStorageMode(mode: StorageMode) {
    this.storageMode = mode;
    if (this.currentUser) {
      try {
        await db.preferences.update(1, { 
          storageMode: mode, 
          userId: this.currentUser,
          lastSynced: new Date().toISOString()
        });
      } catch (error) {
        // Error is handled by the UI
      }
    }
  }

  async getStorageMode(): Promise<StorageMode> {
    if (this.currentUser) {
      try {
        const prefs = await db.preferences.get(1);
        return prefs?.storageMode || 'cloud';
      } catch (error) {
        console.error('Error getting storage mode:', error);
        return 'cloud';
      }
    }
    return 'cloud';
  }

  private async loadPreferences() {
    if (!this.currentUser) {
      return;
    }
    
    try {
      let prefs = await db.preferences.get(1);
      if (!prefs) {
        prefs = {
          id: 1,
          storageMode: 'cloud',
          userId: this.currentUser,
          lastSynced: new Date().toISOString()
        };
        await db.preferences.add(prefs);
      }
      
      this.storageMode = prefs.storageMode;
      this.lastSyncTime = prefs.lastSynced || null;
      
    } catch (error) {
      // Error is handled by the UI
    }
  }

  /**
   * Syncs local changes with the server
   */
  public async syncOfflineData(): Promise<SyncResult> {
    if (this.isSyncing) {
      return this.createSyncResult(false, 0, 0, 0, 'Sync already in progress');
    }

    this.isSyncing = true;
    let successCount = 0;
    let errorCount = 0;
    const now = new Date().toISOString();
    let unsyncedMoments: any[] = [];
    
    try {
      // Check network status
      const { isOnline } = networkStatusStore.get();
      if (isOnline === false) {
        return this.createSyncResult(false, 0, 0, 0, 'Device is offline');
      }

      // First, pull any changes from the server
      const pullResult = await this.syncFromServer();
      if (!pullResult.success) {
        // Error is already included in the pullResult
      }
      
      // Get all unsynced moments (synced = 'pending' or 'error' or undefined)
      unsyncedMoments = await db.moments
        .where('synced')
        .anyOf([0, 1])
        .toArray();
      
      if (unsyncedMoments.length === 0) {
        return this.createSyncResult(true, 0, 0, 0);
      }
      
      // Process each moment for syncing
      for (const moment of unsyncedMoments) {
        if (!moment.id) {
          errorCount++;
          continue;
        }
        
        try {
          const result = await this.syncMoment(moment, now);
          if (result) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          // Update sync status to error
          await this.updateMomentSyncStatus(moment.id!, 0, now);
        }
      }
      
      // Update last sync time in preferences
      if (this.currentUser) {
        this.lastSyncTime = now;
        await db.preferences.update(1, {
          lastSynced: now,
          userId: this.currentUser,
          storageMode: this.storageMode
        });
      }

      if (successCount > 0) {
        void notificationService.sendSyncNotification(successCount);
      }
      
      return this.createSyncResult(
        errorCount === 0,
        successCount,
        errorCount,
        unsyncedMoments.length
      );
      
    } catch (error) {
      return this.createSyncResult(
        false,
        successCount,
        errorCount + 1,
        unsyncedMoments?.length || 0,
        error instanceof Error ? error.message : 'Unknown error during sync'
      );
      
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Syncs a single moment with the server
   */
  private async syncMoment(moment: Moment, timestamp: string): Promise<boolean> {
    const updateData: Partial<Moment> = {
      last_sync_attempt: timestamp,
      synced: 1 as const,
      updated_at: timestamp
    };

    try {
      // Ensure user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }

      // Prepare the data for Supabase
      const supabaseData = {
        id: moment.serverId || undefined,
        content: moment.content,
        feeling: moment.feeling,
        user_id: session.user.id, // Use the authenticated user's ID
        created_at: moment.created_at || timestamp,
        updated_at: timestamp
      };

      // Insert or update the moment in Supabase with proper RLS headers
      const { data, error } = await supabase
        .from('moments')
        .upsert(supabaseData, {
          onConflict: 'id',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local record with server data
      await db.moments.update(moment.id, {
        ...updateData,
        serverId: data.id,
        updated_at: timestamp
      });

      return true;

    } catch (error) {
      await this.updateMomentSyncStatus(moment.id!, 0, timestamp);
      throw error;
    }
  }

  /**
   * Fetches changes from the server and updates local database
   */
  public async syncFromServer(): Promise<SyncResult> {
    if (!this.currentUser) {
      return this.createSyncResult(false, 0, 0, 0, 'No user logged in');
    }

    try {
      const lastSync = this.lastSyncTime || new Date(0).toISOString();
      let syncedCount = 0;
      let errorCount = 0;

      // Get all changes from the server since last sync
      const { data: changes, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', this.currentUser)
        .gt('updated_at', lastSync)
        .order('updated_at', { ascending: true });

      if (error) throw error;

      // Process each change
      for (const change of changes || []) {
        try {
          // Check if we already have this moment locally
          const existingMoment = change.id 
            ? await db.moments.where('serverId').equals(change.id).first()
            : null;

          const momentData: Partial<Moment> = {
            content: change.content,
            feeling: change.feeling,
            user_id: change.user_id,
            created_at: change.created_at,
            updated_at: change.updated_at || new Date().toISOString(),
            serverId: change.id,
            synced: 1
          };

          if (existingMoment) {
            // Update existing moment
            await db.moments.update(existingMoment.id!, momentData);
          } else {
            // Add new moment
            await db.moments.add({
              ...momentData,
              content: change.content || '',
              feeling: change.feeling || '',
              created_at: change.created_at || new Date().toISOString(),
              updated_at: change.updated_at || new Date().toISOString(),
              user_id: change.user_id,
              synced: 1
            } as Moment);
          }
          syncedCount++;
        } catch (error) {
          errorCount++;
          // Error is already handled by the errorCount increment
        }
      }

      return this.createSyncResult(
        errorCount === 0,
        syncedCount,
        errorCount,
        changes?.length || 0
      );

    } catch (error) {
      console.error('Error syncing from server:', error);
      return this.createSyncResult(
        false,
        0,
        1,
        0,
        error instanceof Error ? error.message : 'Unknown error during server sync'
      );
    }
  }

  /**
   * Deletes a moment with soft delete support
   */
  public async deleteMoment(momentId: number): Promise<boolean> {
    const now = new Date().toISOString();
    const moment = await db.moments.get(momentId);
    
    if (!moment) return false;

    try {
      if (moment.serverId) {
        // Mark as deleted in the cloud
        const { error } = await supabase
          .from('moments')
          .update({ 
            updated_at: now 
          })
          .eq('id', moment.serverId);

        if (error) throw error;
      }

      // Delete locally
      await db.moments.delete(momentId);
      return true;

    } catch (error) {
      console.error('Error deleting moment:', error);
      
      // If online delete fails, mark for later sync
      await db.moments.update(momentId, {
        synced: 0,
        updated_at: now
      });
      
      throw error;
    }
  }

  /**
   * Updates a moment's sync status
   */
  private async updateMomentSyncStatus(
    momentId: number, 
    status: SyncStatus, 
    timestamp: string
  ): Promise<void> {
    try {
      await db.moments.update(momentId, {
        synced: status,
        last_sync_attempt: timestamp,
        updated_at: timestamp
      });
    } catch (error) {
      console.warn('Could not update moment sync status:', error);
    }
  }

  /**
   * Helper to create consistent sync results
   */
  private createSyncResult(
    success: boolean,
    syncedCount: number,
    errorCount: number,
    total: number,
    error?: string
  ): SyncResult {
    return { success, syncedCount, errorCount, total, error };
  }

  startAutoSync() {
    if (this.storageMode === 'local') return;
    
    // Initial sync
    this.syncOfflineData();

    // Set up interval-based sync
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = window.setInterval(() => {
      this.syncOfflineData();
    }, 1000 * 60 * 5); // Sync every 5 minutes

    // Set up event-based sync for when the app comes online
    window.addEventListener('online', this.handleOnline);
  }

  private handleOnline = () => {
    this.syncOfflineData();
  };

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    window.removeEventListener('online', this.handleOnline);
  }
}

export const syncService = new SyncService();