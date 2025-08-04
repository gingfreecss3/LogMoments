import { supabase } from '../supabase';
import { offlineStorage } from './offlineStorage';

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async syncOfflineData() {
    if (this.isSyncing) return;
    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return;
    }

    this.isSyncing = true;
    const unsyncedMoments = offlineStorage.getUnsyncedMoments();

    if (unsyncedMoments.length === 0) {
      this.isSyncing = false;
      return;
    }

    console.log(`Syncing ${unsyncedMoments.length} moments...`);

    try {
      for (const moment of unsyncedMoments) {
        try {
          const { error } = await supabase
            .from('moments')
            .insert({
              content: moment.content,
              feeling: moment.feeling,
              created_at: moment.created_at,
              user_id: moment.user_id
            });

          if (!error) {
            console.log('Successfully synced moment:', moment.id);
            offlineStorage.markAsSynced(moment.id);
          } else {
            console.error('Error syncing moment:', error);
            // If there's an error, stop the sync and try again later
            break;
          }
        } catch (error) {
          console.error('Error in sync loop:', error);
          break;
        }
      }

      // Clean up successfully synced moments
      offlineStorage.removeSyncedMoments();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
      // Notify any listeners that sync is complete
      window.dispatchEvent(new Event('syncComplete'));
    }
  }

  startAutoSync() {
    // Initial sync check
    this.syncOfflineData();

    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('Network: Online, starting sync...');
      this.syncOfflineData();
    });

    // Clear any existing interval to prevent duplicates
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up periodic sync check
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        console.log('Periodic sync check...');
        this.syncOfflineData();
      }
    }, 30000); // Check every 30 seconds

    // Return cleanup function
    return () => {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
    };
  }

  // Clean up resources when needed
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();