import { LocalNotifications } from '@capacitor/local-notifications';
import type {
  ActionPerformed,
  LocalNotificationSchema
} from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import type {
  PushNotificationSchema,
  Token,
  ActionPerformed as PushActionPerformed
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { nativeStorage } from './nativeStorage';

export interface NotificationConfig {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  momentReminders: boolean;
}

class NotificationService {
  private readonly isNative = Capacitor.isNativePlatform();
  private readonly CONFIG_KEY = 'notification_config';
  private readonly defaultConfig: NotificationConfig = {
    enabled: true,
    dailyReminder: true,
    reminderTime: '20:00',
    momentReminders: true,
  };

  async initialize(): Promise<void> {
    if (!this.isNative) {
      console.log('Notifications only available on native platforms');
      return;
    }

    try {
      await this.requestPermissions();
      await this.setupLocalNotifications();
      await this.setupPushNotifications();
      await this.scheduleDailyReminder();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const localResult = await LocalNotifications.requestPermissions();
      
      if (localResult.display !== 'granted') {
        console.log('Local notification permission not granted');
        return false;
      }

      const pushResult = await PushNotifications.requestPermissions();
      
      if (pushResult.receive !== 'granted') {
        console.log('Push notification permission not granted');
      }

      return localResult.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  private async setupLocalNotifications(): Promise<void> {
    LocalNotifications.addListener('localNotificationReceived', (notification: LocalNotificationSchema) => {
      console.log('Local notification received:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Local notification action performed:', action);
      if (action.actionId === 'tap') {
        window.location.href = '/';
      }
    });
  }

  private async setupPushNotifications(): Promise<void> {
    if (!this.isNative) return;

    try {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        nativeStorage.setItem('push_token', token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action: PushActionPerformed) => {
        console.log('Push notification action performed:', action);
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  async scheduleDailyReminder(): Promise<void> {
    if (!this.isNative) return;

    const config = await this.getConfig();
    if (!config.enabled || !config.dailyReminder) {
      await this.cancelDailyReminder();
      return;
    }

    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.log('No notification permission for daily reminder');
        return;
      }

      await this.cancelDailyReminder();

      const [hours, minutes] = config.reminderTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Time to Capture Your Moment 💜',
            body: 'How are you feeling today? Take a moment to reflect.',
            schedule: {
              at: scheduledTime,
              every: 'day',
            },
            sound: undefined,
            smallIcon: 'ic_launcher',
            actionTypeId: 'OPEN_APP',
          }
        ]
      });

      console.log('Daily reminder scheduled for', scheduledTime);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  async cancelDailyReminder(): Promise<void> {
    if (!this.isNative) return;

    try {
      const pending = await LocalNotifications.getPending();
      const dailyReminder = pending.notifications.find(n => n.id === 1);
      
      if (dailyReminder) {
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
        console.log('Daily reminder cancelled');
      }
    } catch (error) {
      console.error('Error cancelling daily reminder:', error);
    }
  }

  async sendMomentCapturedNotification(): Promise<void> {
    if (!this.isNative) return;

    const config = await this.getConfig();
    if (!config.enabled || !config.momentReminders) return;

    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Moment Captured! ✨',
            body: 'Your moment has been saved successfully.',
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            smallIcon: 'ic_launcher',
          }
        ]
      });
    } catch (error) {
      console.error('Error sending moment captured notification:', error);
    }
  }

  async sendSyncNotification(count: number): Promise<void> {
    if (!this.isNative) return;

    const config = await this.getConfig();
    if (!config.enabled) return;

    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Moments Synced 🔄',
            body: `${count} moment${count > 1 ? 's' : ''} synced successfully.`,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            smallIcon: 'ic_launcher',
          }
        ]
      });
    } catch (error) {
      console.error('Error sending sync notification:', error);
    }
  }

  async getConfig(): Promise<NotificationConfig> {
    const config = await nativeStorage.getObject<NotificationConfig>(this.CONFIG_KEY);
    return config || this.defaultConfig;
  }

  async updateConfig(config: Partial<NotificationConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const newConfig = { ...currentConfig, ...config };
    await nativeStorage.setObject(this.CONFIG_KEY, newConfig);

    if (config.enabled !== undefined || config.dailyReminder !== undefined || config.reminderTime !== undefined) {
      await this.scheduleDailyReminder();
    }
  }

  async getPendingNotifications(): Promise<LocalNotificationSchema[]> {
    if (!this.isNative) return [];

    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (!this.isNative) return;

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }
}

export const notificationService = new NotificationService();
