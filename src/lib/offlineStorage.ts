interface OfflineMoment {
    id: string;
    content: string;
    feeling: string;
    created_at: string;
    user_id: string;
    isOffline: boolean;
    synced: boolean;
  }
  
  class OfflineStorage {
    private readonly MOMENTS_KEY = 'thoughts_offline_moments';
    private readonly USER_KEY = 'thoughts_user_data';
  
    // Save moment to local storage
    saveMoment(moment: Omit<OfflineMoment, 'id' | 'isOffline' | 'synced'>): OfflineMoment {
      const offlineMoment: OfflineMoment = {
        ...moment,
        id: `offline_${Date.now()}_${Math.random()}`,
        isOffline: true,
        synced: false
      };
  
      const existingMoments = this.getOfflineMoments();
      existingMoments.push(offlineMoment);
      localStorage.setItem(this.MOMENTS_KEY, JSON.stringify(existingMoments));
  
      return offlineMoment;
    }
  
    // Get all offline moments
    getOfflineMoments(): OfflineMoment[] {
      const moments = localStorage.getItem(this.MOMENTS_KEY);
      return moments ? JSON.parse(moments) : [];
    }
  
    // Get unsynced moments
    getUnsyncedMoments(): OfflineMoment[] {
      return this.getOfflineMoments().filter(moment => !moment.synced);
    }
  
    // Mark moment as synced
    markAsSynced(offlineId: string) {
      const moments = this.getOfflineMoments();
      const updatedMoments = moments.map(moment => 
        moment.id === offlineId ? { ...moment, synced: true } : moment
      );
      localStorage.setItem(this.MOMENTS_KEY, JSON.stringify(updatedMoments));
    }
  
    // Remove synced moments
    removeSyncedMoments() {
      const moments = this.getOfflineMoments();
      const unsyncedMoments = moments.filter(moment => !moment.synced);
      localStorage.setItem(this.MOMENTS_KEY, JSON.stringify(unsyncedMoments));
    }
  
    // Clear all offline data
    clearOfflineData() {
      localStorage.removeItem(this.MOMENTS_KEY);
    }
  
    // Check if user is offline
    isOffline(): boolean {
      return !navigator.onLine;
    }
  
    // Save user data for offline use
    saveUserData(userData: any) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }
  
    // Get user data
    getUserData(): any {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
  }
  
  // Create and export the instance
  export const offlineStorage = new OfflineStorage();