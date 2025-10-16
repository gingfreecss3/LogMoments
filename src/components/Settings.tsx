import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { syncService } from '../lib/syncService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { DatabaseStatus } from './DatabaseStatus';
import { NotificationSettings } from './NotificationSettings';

interface SettingsProps {
  userId: string;
}

export function Settings({ userId }: SettingsProps) {
  const [storageMode, setStorageMode] = useState<'local' | 'cloud'>('cloud');
  const [lastSynced, setLastSynced] = useState<string>('');
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    // Initialize sync service with current user
    syncService.setUser(userId);
    
    // Load current preferences
    const loadPreferences = async () => {
      const mode = await syncService.getStorageMode();
      setStorageMode(mode);
      
      const prefs = await db.preferences.get(1);
      if (prefs?.lastSynced) {
        setLastSynced(new Date(prefs.lastSynced).toLocaleString());
      }
    };
    
    loadPreferences();
  }, [userId]);

  const handleStorageModeChange = async (newMode: 'local' | 'cloud') => {
    if (newMode !== storageMode) {
      setStorageMode(newMode);
      await syncService.setStorageMode(newMode);
      
      if (newMode === 'cloud' && isOnline) {
        // If switching to cloud mode and online, trigger a sync
        syncService.syncOfflineData();
      }
    }
  };

  const handleManualSync = async () => {
    if (isOnline) {
      await syncService.syncOfflineData();
      const prefs = await db.preferences.get(1);
      if (prefs?.lastSynced) {
        setLastSynced(new Date(prefs.lastSynced).toLocaleString());
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Storage Mode</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="cloud-storage"
              type="radio"
              className="h-4 w-4 text-blue-600"
              checked={storageMode === 'cloud'}
              onChange={() => handleStorageModeChange('cloud')}
            />
            <label htmlFor="cloud-storage" className="ml-2 block text-sm font-medium">
              Cloud Storage (Sync across devices)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="local-storage"
              type="radio"
              className="h-4 w-4 text-blue-600"
              checked={storageMode === 'local'}
              onChange={() => handleStorageModeChange('local')}
            />
            <label htmlFor="local-storage" className="ml-2 block text-sm font-medium">
              Local Storage (This device only)
            </label>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          {storageMode === 'cloud' 
            ? 'Your data will be synced to the cloud when online.'
            : 'Your data will be stored only on this device.'}
        </p>
      </div>

      <div className="mt-6">
        <NotificationSettings />
      </div>

      {storageMode === 'cloud' && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Sync Status</h3>
              <p className="text-sm text-gray-500">
                {lastSynced 
                  ? `Last synced: ${lastSynced}` 
                  : 'Never synced'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={!isOnline}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isOnline 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Sync Now
            </button>
          </div>
          {!isOnline && (
            <p className="mt-2 text-sm text-yellow-600">
              You're offline. Connect to the internet to sync your data.
            </p>
          )}
          
        </div>
      )}
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Database Status</h3>
        <DatabaseStatus />
      </div>
    </div>
  );
}
