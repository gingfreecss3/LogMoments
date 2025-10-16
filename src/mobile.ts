import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativeMobile = () => Capacitor.isNativePlatform();

export const initializeMobileApp = async () => {
  if (!isNativeMobile()) {
    return;
  }

  try {
    // Configure Status Bar
    if (Capacitor.getPlatform() !== 'web') {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }

    // Configure Keyboard
    await Keyboard.setAccessoryBarVisible({ isVisible: true });

    // Hide splash screen after initialization
    await SplashScreen.hide();

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Handle back button on Android
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
