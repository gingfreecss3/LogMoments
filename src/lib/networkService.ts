import { Network } from '@capacitor/network';
import type { ConnectionStatus } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { networkStatusStore } from '../hooks/useNetworkStatus';
import { logger } from './logger';

class NetworkService {
  private readonly isNative = Capacitor.isNativePlatform();
  private listeners: Array<(status: boolean) => void> = [];
  private initialized = false;
  private nativeListener?: PluginListenerHandle;
  private handleOnline?: () => void;
  private handleOffline?: () => void;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    if (!this.isNative) {
      this.initializeBrowserListeners();
      return;
    }

    try {
      const status = await Network.getStatus();
      this.updateNetworkStatus(status.connected);

      this.nativeListener = await Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        logger.info('Network status changed', { connected: status.connected, connectionType: status.connectionType });
        this.updateNetworkStatus(status.connected);
      });

      logger.info('Network service initialized successfully');
    } catch (error) {
      logger.error('Error initializing network service', error);
      this.initializeBrowserListeners();
    }
  }

  private initializeBrowserListeners(): void {
    if (this.handleOnline || this.handleOffline) {
      return;
    }

    this.handleOnline = () => this.updateNetworkStatus(true);
    this.handleOffline = () => this.updateNetworkStatus(false);

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private updateNetworkStatus(isOnline: boolean): void {
    networkStatusStore.set({ isOnline });
    this.listeners.forEach(listener => listener(isOnline));
  }

  async getCurrentStatus(): Promise<boolean> {
    if (!this.isNative) {
      return navigator.onLine;
    }

    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (error) {
      logger.error('Error getting network status', error);
      return navigator.onLine;
    }
  }

  async getConnectionType(): Promise<string> {
    if (!this.isNative) {
      return 'unknown';
    }

    try {
      const status = await Network.getStatus();
      return status.connectionType;
    } catch (error) {
      logger.error('Error getting connection type', error);
      return 'unknown';
    }
  }

  addListener(callback: (status: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  async removeAllListeners(): Promise<void> {
    this.listeners = [];

    if (this.nativeListener) {
      await this.nativeListener.remove();
      this.nativeListener = undefined;
    }

    if (this.handleOnline) {
      window.removeEventListener('online', this.handleOnline);
      this.handleOnline = undefined;
    }

    if (this.handleOffline) {
      window.removeEventListener('offline', this.handleOffline);
      this.handleOffline = undefined;
    }

    this.initialized = false;
  }
}

export const networkService = new NetworkService();
