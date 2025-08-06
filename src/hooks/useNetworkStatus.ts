import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';

export const networkStatusStore = atom({ isOnline: navigator.onLine });

// This function can be called once in your app's entry point (e.g., main.tsx)
// to initialize the network event listeners.
export function initializeNetworkListener() {
  const handleOnline = () => networkStatusStore.set({ isOnline: true });
  const handleOffline = () => networkStatusStore.set({ isOnline: false });

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return a cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export const useNetworkStatus = () => {
  const { isOnline } = useStore(networkStatusStore);
  return { isOnline };
};