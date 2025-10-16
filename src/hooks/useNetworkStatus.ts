import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';
import { networkService } from '../lib/networkService';

export const networkStatusStore = atom({ isOnline: navigator.onLine });

export async function initializeNetworkListener() {
  await networkService.initialize();

  return async () => {
    await networkService.removeAllListeners();
  };
}

export const useNetworkStatus = () => {
  const { isOnline } = useStore(networkStatusStore);
  return { isOnline };
};