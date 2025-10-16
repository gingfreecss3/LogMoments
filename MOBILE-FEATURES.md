# 📱 Mobile Features Documentation

This document describes all the native mobile features implemented in LogMoments using Capacitor.

## 🎯 Overview

LogMoments leverages Capacitor to provide a native mobile experience with the following features:

- **Native Storage** - Secure, native storage using Capacitor Preferences
- **Local Notifications** - Daily reminders and moment capture notifications
- **Push Notifications** - Ready for server-side push notification integration
- **Network Detection** - Native network status monitoring
- **Haptic Feedback** - Tactile feedback for user interactions
- **Share API** - Native sharing of moments
- **App Lifecycle** - Proper handling of app state changes
- **Auto-sync** - Automatic background sync when app resumes

## 📦 Installed Plugins

### Core Plugins
- `@capacitor/app` - App state, lifecycle, and back button handling
- `@capacitor/core` - Core Capacitor functionality
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/keyboard` - Keyboard behavior
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/splash-screen` - Splash screen management

### Storage & Data
- `@capacitor/preferences` - Native key-value storage
- `@capacitor/network` - Network status monitoring

### Notifications
- `@capacitor/local-notifications` - Local/scheduled notifications
- `@capacitor/push-notifications` - Push notification support

### Sharing & Media
- `@capacitor/share` - Native share functionality
- `@capacitor/camera` - Camera and photo library access (ready for future use)

## 🏗️ Architecture

### Storage Layer

#### Native Storage (`src/lib/nativeStorage.ts`)
A unified storage wrapper that automatically uses:
- **Capacitor Preferences** on native platforms (iOS/Android)
- **localStorage** on web platforms

```typescript
import { nativeStorage } from './lib/nativeStorage';

// Store string
await nativeStorage.setItem('key', 'value');

// Retrieve string
const value = await nativeStorage.getItem('key');

// Store object
await nativeStorage.setObject('user', { id: 1, name: 'John' });

// Retrieve object
const user = await nativeStorage.getObject('user');
```

#### Offline Storage (`src/lib/offlineStorage.ts`)
Enhanced offline storage that now uses native storage on mobile:
- Automatic fallback to native storage on mobile devices
- All methods are now async for consistency
- Seamless storage of moments, user data, and sync status

### Notification System

#### Notification Service (`src/lib/notificationService.ts`)

Comprehensive notification management:

```typescript
import { notificationService } from './lib/notificationService';

// Initialize (called automatically on app start)
await notificationService.initialize();

// Request permissions
const granted = await notificationService.requestPermissions();

// Schedule daily reminder
await notificationService.scheduleDailyReminder();

// Send moment captured notification
await notificationService.sendMomentCapturedNotification();

// Send sync notification
await notificationService.sendSyncNotification(count);

// Update configuration
await notificationService.updateConfig({
  enabled: true,
  dailyReminder: true,
  reminderTime: '20:00',
  momentReminders: true
});
```

**Features:**
- ✅ Daily reminder at customizable time
- ✅ Moment captured confirmation
- ✅ Sync completion notifications
- ✅ Permission management
- ✅ Configuration persistence

### Network Monitoring

#### Network Service (`src/lib/networkService.ts`)

Native network status monitoring:

```typescript
import { networkService } from './lib/networkService';

// Initialize (called automatically)
await networkService.initialize();

// Get current status
const isOnline = await networkService.getCurrentStatus();

// Get connection type (wifi, cellular, etc.)
const type = await networkService.getConnectionType();

// Add listener
const removeListener = networkService.addListener((isOnline) => {
  console.log('Network status:', isOnline);
});
```

**Features:**
- ✅ Real-time network status updates
- ✅ Connection type detection
- ✅ Automatic nanostores integration
- ✅ Fallback to browser API on web

### Share Functionality

#### Share Service (`src/lib/shareService.ts`)

Native sharing capabilities:

```typescript
import { shareService } from './lib/shareService';

// Share a moment
await shareService.shareMoment(content, feeling);

// Share text
await shareService.shareText('Hello world', 'Title');

// Share URL
await shareService.shareUrl('https://example.com', 'Title', 'Description');
```

**Features:**
- ✅ Native share sheet on mobile
- ✅ Web Share API on supported browsers
- ✅ Clipboard fallback
- ✅ Formatted moment sharing

### Enhanced Mobile Integration

#### Mobile Module (`src/mobile.ts`)

Enhanced app lifecycle management:

```typescript
import { initializeMobileApp, getMobileInfo, exitApp } from './mobile';

// Initialize all mobile features
await initializeMobileApp();

// Get app info
const info = await getMobileInfo();
// { name, version, build, platform }

// Exit app (Android)
await exitApp();
```

**Features:**
- ✅ Automatic initialization of all services
- ✅ Status bar configuration
- ✅ Keyboard management
- ✅ Back button handling (Android)
- ✅ App state change listeners
- ✅ Auto-sync on app resume

## 🎨 UI Components

### Notification Settings (`src/components/NotificationSettings.tsx`)

A complete settings UI for notifications:

```tsx
import { NotificationSettings } from './components/NotificationSettings';

<NotificationSettings />
```

**Features:**
- Toggle notifications on/off
- Enable/disable daily reminders
- Set reminder time
- Toggle moment captured notifications
- Permission request handling
- Platform detection (shows info on web)

### Enhanced QuickCapture

Now includes:
- Haptic feedback on moment capture
- Native notifications on save
- Success/error haptic patterns

### Enhanced MomentsTimeline

Now includes:
- Share button for each moment
- Native share sheet integration
- Haptic feedback on share

## 🔧 Configuration

### Capacitor Config (`capacitor.config.ts`)

```typescript
{
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#9333EA'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    // ... other plugins
  }
}
```

## 🚀 Usage Examples

### Basic Flow

1. **App Starts**
   ```typescript
   // Automatically in main.tsx
   initializeMobileApp();
   ```

2. **User Captures Moment**
   ```typescript
   // In QuickCapture component
   await db.moments.add(momentData);
   await notificationService.sendMomentCapturedNotification();
   await hapticNotification('Success');
   ```

3. **App Goes to Background**
   ```typescript
   // Automatically handled
   // Sync paused
   ```

4. **App Returns to Foreground**
   ```typescript
   // Automatically handled
   // Network check + auto-sync triggered
   ```

### Setting Up Notifications

```typescript
// In your settings component
import { notificationService } from './lib/notificationService';

// Enable notifications
await notificationService.updateConfig({ enabled: true });

// Set daily reminder
await notificationService.updateConfig({
  dailyReminder: true,
  reminderTime: '20:00'
});
```

### Sharing a Moment

```typescript
import { useShare } from './hooks/useShare';

const { shareMoment, isSharing } = useShare();

<button 
  onClick={() => shareMoment(content, feeling)}
  disabled={isSharing}
>
  Share
</button>
```

## 🔐 Permissions

### Android Permissions

Required permissions are automatically added when plugins are synced:

- **Notifications** - For local and push notifications
- **Network State** - For network monitoring
- **Internet** - For syncing data

### iOS Permissions

Info.plist entries are automatically added:

- **NSUserNotificationsUsageDescription** - For notifications
- **NSPhotoLibraryUsageDescription** - For camera (if used)
- **NSCameraUsageDescription** - For camera (if used)

## 🧪 Testing

### Test on iOS Simulator
```bash
npm run mobile:ios
```

### Test on Android Emulator
```bash
npm run mobile:android
```

### Test Notifications
1. Enable notifications in settings
2. Close the app completely
3. Wait for scheduled time or trigger manual notification
4. Notification should appear in system tray

### Test Network Detection
1. Open app with WiFi on
2. Turn off WiFi
3. App should show offline status
4. Turn WiFi back on
5. App should sync automatically

### Test Sharing
1. Open a moment
2. Click share button
3. Native share sheet should appear
4. Select share target (Messages, etc.)

## 📝 Migration from localStorage

All existing data is automatically compatible. The system seamlessly migrates between:
- Web localStorage
- Native Capacitor Preferences

No data migration script needed - the nativeStorage wrapper handles it transparently.

## 🐛 Troubleshooting

### Notifications Not Working

1. Check permissions:
   ```typescript
   const hasPermission = await notificationService.checkPermissions();
   ```

2. Request permissions if needed:
   ```typescript
   await notificationService.requestPermissions();
   ```

3. Check if notifications are enabled:
   ```typescript
   const config = await notificationService.getConfig();
   console.log(config.enabled);
   ```

### Network Detection Not Working

1. Ensure network service is initialized:
   ```typescript
   await networkService.initialize();
   ```

2. Check current status:
   ```typescript
   const status = await networkService.getCurrentStatus();
   ```

### Storage Issues

1. Check if running on native platform:
   ```typescript
   const isNative = nativeStorage.isNativePlatform();
   ```

2. Test storage:
   ```typescript
   await nativeStorage.setItem('test', 'value');
   const value = await nativeStorage.getItem('test');
   console.log(value === 'value');
   ```

## 🎯 Future Enhancements

Ready for implementation:

- [ ] **Camera Integration** - Add photos to moments
- [ ] **Biometric Authentication** - Secure app with fingerprint/face ID
- [ ] **Background Sync** - Sync even when app is closed
- [ ] **Rich Notifications** - Add images and actions to notifications
- [ ] **App Shortcuts** - Quick actions from home screen
- [ ] **Widget Support** - Home screen widget for quick capture
- [ ] **Dark Mode** - Automatic theme switching
- [ ] **Geolocation** - Tag moments with location

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Local Notifications Plugin](https://capacitorjs.com/docs/apis/local-notifications)
- [Preferences Plugin](https://capacitorjs.com/docs/apis/preferences)
- [Network Plugin](https://capacitorjs.com/docs/apis/network)
- [Share Plugin](https://capacitorjs.com/docs/apis/share)

---

**Built with 💜 for native mobile experiences**
