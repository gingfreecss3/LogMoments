import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface PhotoResult {
  dataUrl: string;
  format: string;
  saved: boolean;
}

class CameraService {
  private readonly isNative = Capacitor.isNativePlatform();

  async checkPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return true; // Web always has permission through user action
    }

    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) {
      return true;
    }

    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  async takePhoto(): Promise<PhotoResult | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permissions not granted');
        }
      }

      const photo: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
      });

      if (!photo.dataUrl) {
        throw new Error('Failed to capture photo');
      }

      return {
        dataUrl: photo.dataUrl,
        format: photo.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  async pickPhoto(): Promise<PhotoResult | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Photo library permissions not granted');
        }
      }

      const photo: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (!photo.dataUrl) {
        throw new Error('Failed to pick photo');
      }

      return {
        dataUrl: photo.dataUrl,
        format: photo.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error picking photo:', error);
      return null;
    }
  }

  async promptPhotoSource(): Promise<PhotoResult | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Camera permissions not granted');
        }
      }

      const photo: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        saveToGallery: false,
      });

      if (!photo.dataUrl) {
        throw new Error('Failed to get photo');
      }

      return {
        dataUrl: photo.dataUrl,
        format: photo.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error getting photo:', error);
      return null;
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }
}

export const cameraService = new CameraService();
