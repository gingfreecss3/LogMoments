import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

class NativeStorage {
  private readonly isNative = Capacitor.isNativePlatform();

  async setItem(key: string, value: string): Promise<void> {
    if (this.isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }

  async keys(): Promise<string[]> {
    if (this.isNative) {
      const { keys } = await Preferences.keys();
      return keys;
    } else {
      return Object.keys(localStorage);
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }
}

export const nativeStorage = new NativeStorage();
