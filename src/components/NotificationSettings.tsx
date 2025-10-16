import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { notificationService } from '../lib/notificationService';
import type { NotificationConfig } from '../lib/notificationService';

export const NotificationSettings: React.FC = () => {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const currentConfig = await notificationService.getConfig();
      setConfig(currentConfig);
      const permission = await notificationService.checkPermissions();
      setHasPermission(permission);
    } catch (error) {
      console.error('Error loading notification config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!config) return;

    if (!config.enabled && !hasPermission) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        alert('Notification permissions are required to enable notifications.');
        return;
      }
      setHasPermission(true);
    }

    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    await notificationService.updateConfig({ enabled: newConfig.enabled });
  };

  const handleToggleDailyReminder = async () => {
    if (!config) return;

    const newConfig = { ...config, dailyReminder: !config.dailyReminder };
    setConfig(newConfig);
    await notificationService.updateConfig({ dailyReminder: newConfig.dailyReminder });
  };

  const handleToggleMomentReminders = async () => {
    if (!config) return;

    const newConfig = { ...config, momentReminders: !config.momentReminders };
    setConfig(newConfig);
    await notificationService.updateConfig({ momentReminders: newConfig.momentReminders });
  };

  const handleReminderTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!config) return;

    const newTime = e.target.value;
    const newConfig = { ...config, reminderTime: newTime };
    setConfig(newConfig);
    await notificationService.updateConfig({ reminderTime: newTime });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  if (!notificationService.isNativePlatform()) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <BellOff className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              Native notifications unavailable
            </h3>
            <p className="text-sm text-blue-700">
              Install the app on your device to enable native notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Enable Notifications</h4>
            <p className="text-sm text-gray-500">Receive app notifications</p>
          </div>
          <button
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.enabled && (
          <>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Daily Reminder</h4>
                <p className="text-sm text-gray-500">Get reminded to capture moments</p>
              </div>
              <button
                onClick={handleToggleDailyReminder}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.dailyReminder ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.dailyReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.dailyReminder && (
              <div className="py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Reminder Time</h4>
                </div>
                <input
                  type="time"
                  value={config.reminderTime}
                  onChange={handleReminderTimeChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Moment Captured</h4>
                <p className="text-sm text-gray-500">Notify when moments are saved</p>
              </div>
              <button
                onClick={handleToggleMomentReminders}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.momentReminders ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.momentReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
