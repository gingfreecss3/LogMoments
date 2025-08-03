import { supabase } from '../supabase';
import { offlineStorage } from './offlineStorage';

class SyncService {
  private isSyncing = false;

  async syncOfflineData() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    const unsyncedMoments = offlineStorage.getUnsyncedMoments();

    if (unsyncedMoments.length === 0) {
      this.isSyncing = false;
      return;
    }

    try {
      for (const moment of unsyncedMoments) {
        const { error } = await supabase
          .from('moments')
          .insert({
            content: moment.content,
            feeling: moment.feeling,
            created_at: moment.created_at,
            user_id: moment.user_id
          });

        if (!error) {
          offlineStorage.markAsSynced(moment.id);
        }
      }

      // Clean up synced moments
      offlineStorage.removeSyncedMoments();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async startAutoSync() {
    // Sync when coming back online
    window.addEventListener('online', () => {
      this.syncOfflineData();
    });

    // Periodic sync check
    setInterval(() => {
      if (navigator.onLine) {
        this.syncOfflineData();
      }
    }, 30000); // Check every 30 seconds
  }
}

export const syncService = new SyncService(); 