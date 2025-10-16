import { nativeStorage } from './nativeStorage';
import { STORAGE_KEYS } from './constants';

export interface OfflineMoment {
    id: string;
    content: string;
    feeling: string;
    photo?: string;
    created_at: string;
    user_id: string;
    isOffline: boolean;
    synced: boolean;
  }
  
  class OfflineStorage {
    private readonly MOMENTS_KEY = STORAGE_KEYS.MOMENTS;
    private readonly USER_KEY = STORAGE_KEYS.USER_DATA;
  
    async saveMoment(moment: Omit<OfflineMoment, 'id' | 'isOffline' | 'synced'>): Promise<OfflineMoment> {
      const uid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const offlineMoment: OfflineMoment = {
        ...moment,
        id: `offline_${uid}`,
        isOffline: true,
        synced: false
      };
  
      const existingMoments = await this.getOfflineMoments();
      existingMoments.push(offlineMoment);
      await nativeStorage.setObject(this.MOMENTS_KEY, existingMoments);
  
      return offlineMoment;
    }
  
    async getOfflineMoments(): Promise<OfflineMoment[]> {
      const moments = await nativeStorage.getObject<OfflineMoment[]>(this.MOMENTS_KEY);
      return moments || [];
    }
  
    async getUnsyncedMoments(): Promise<OfflineMoment[]> {
      const moments = await this.getOfflineMoments();
      return moments.filter(moment => !moment.synced);
    }
  
    async markAsSynced(offlineId: string): Promise<void> {
      const moments = await this.getOfflineMoments();
      const updatedMoments = moments.map(moment => 
        moment.id === offlineId ? { ...moment, synced: true } : moment
      );
      await nativeStorage.setObject(this.MOMENTS_KEY, updatedMoments);
    }
  
    async removeSyncedMoments(): Promise<void> {
      const moments = await this.getOfflineMoments();
      const unsyncedMoments = moments.filter(moment => !moment.synced);
      await nativeStorage.setObject(this.MOMENTS_KEY, unsyncedMoments);
    }
  
    async clearOfflineData(): Promise<void> {
      await nativeStorage.removeItem(this.MOMENTS_KEY);
    }
  
    isOffline(): boolean {
      return !navigator.onLine;
    }
  
    async saveUserData(userData: any): Promise<void> {
      await nativeStorage.setObject(this.USER_KEY, userData);
    }
  
    async getUserData(): Promise<any> {
      return await nativeStorage.getObject(this.USER_KEY);
    }
  }
  
  export const offlineStorage = new OfflineStorage();