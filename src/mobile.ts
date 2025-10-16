import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { AppState } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { notificationService } from './lib/notificationService';
import { networkService } from './lib/networkService';
import { syncService } from './lib/syncService';
import { cameraService } from './lib/cameraService';

export const isNativeMobile = () => Capacitor.isNativePlatform();

export const initializeMobileApp = async () => {
  if (!isNativeMobile()) {
    return;
  }

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }

    await Keyboard.setAccessoryBarVisible({ isVisible: true });

    await notificationService.initialize();
    await networkService.initialize();

    try {
      await cameraService.requestPermissions();
    } catch (error) {
      console.error('Camera permissions request failed:', error);
    }

    await SplashScreen.hide();

    App.addListener('appStateChange', async (state: AppState) => {
      console.log('App state changed. Is active:', state.isActive);
      
      if (state.isActive) {
        const isOnline = await networkService.getCurrentStatus();
        if (isOnline) {
          console.log('App resumed and online, triggering sync');
          syncService.syncOfflineData().catch(console.error);
        }
      }
    });

    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};

export const getMobileInfo = async () => {
  if (!isNativeMobile()) {
    return null;
  }

  const info = await App.getInfo();
  return {
    name: info.name,
    version: info.version,
    build: info.build,
    platform: Capacitor.getPlatform(),
  };
};

export const exitApp = async () => {
  if (!isNativeMobile()) {
    return;
  }
  await App.exitApp();
};

export const minimizeApp = async () => {
  if (!isNativeMobile()) {
    return;
  }
  await App.minimizeApp();
};
