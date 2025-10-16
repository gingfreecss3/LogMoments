# 📱 Mobile Quick Start Guide

## Prerequisites Checklist

### Android
- [ ] Install [Android Studio](https://developer.android.com/studio)
- [ ] Set ANDROID_HOME environment variable
- [ ] Install JDK 17+

### iOS
- [ ] Have a Mac computer
- [ ] Install [Xcode](https://developer.apple.com/xcode/)
- [ ] Install CocoaPods: `sudo gem install cocoapods`

## Quick Commands

```bash
# 1. Install dependencies
npm install

# 2. Build and sync (required before first run)
npm run mobile:sync

# 3. Run on Android
npm run mobile:android     # Opens Android Studio
npm run mobile:run:android # Builds and runs directly

# 4. Run on iOS
npm run mobile:ios         # Opens Xcode
npm run mobile:run:ios     # Builds and runs directly
```

## Development Workflow

### Making Code Changes

```bash
# Option 1: Manual sync after changes
npm run build              # Build web assets
npx cap sync              # Sync to native projects

# Option 2: Live reload (recommended)
npm run dev                # Start dev server
npx cap run android --livereload --external
# OR
npx cap run ios --livereload --external
```

### Common Tasks

```bash
# Update web assets in mobile apps
npm run mobile:sync

# Only sync without building
npx cap sync

# Copy without updating plugins
npx cap copy

# Update native dependencies
npx cap update

# Clean and rebuild
cd android && ./gradlew clean && cd ..
npx cap sync
```

## Mobile Features Available

### Core Plugins (Already Installed)
- ✅ **App** - App state, back button, deep linking
- ✅ **Haptics** - Vibration feedback
- ✅ **Keyboard** - Keyboard behavior and events
- ✅ **Status Bar** - Status bar styling
- ✅ **Splash Screen** - Launch screen

### Using Mobile Features in Code

```typescript
import { useMobile } from './hooks/useMobile';
import { ImpactStyle } from '@capacitor/haptics';

function MyComponent() {
  const { isMobile, hapticFeedback } = useMobile();

  const handleClick = async () => {
    await hapticFeedback(ImpactStyle.Light);
    // Your logic here
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Installing Additional Plugins

```bash
# Camera
npm install @capacitor/camera
npx cap sync

# Share
npm install @capacitor/share
npx cap sync

# Geolocation
npm install @capacitor/geolocation
npx cap sync
```

Browse all plugins: https://capacitorjs.com/docs/plugins

## Troubleshooting

### Android Issues

**Problem**: Build fails
```bash
cd android
./gradlew clean
cd ..
npm run mobile:sync
```

**Problem**: SDK not found
```bash
# Set in ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### iOS Issues

**Problem**: CocoaPods errors
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
```

**Problem**: Xcode signing errors
- Open Xcode
- Select project in left sidebar
- Go to "Signing & Capabilities"
- Select your team/account

### General Issues

**Problem**: Changes not showing
```bash
# Clear and rebuild everything
rm -rf dist
npm run build
npx cap sync
```

**Problem**: Plugin not working
```bash
# Reinstall plugins
npm install
npx cap sync
```

## Testing

### On Emulator/Simulator
- Android: Open Android Studio → AVD Manager → Create/Start emulator
- iOS: Run from Xcode and select simulator

### On Real Device
- Android: Enable USB debugging, connect device, run app
- iOS: Connect device, select in Xcode, trust developer cert on device

## Building for Production

### Android APK
```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### iOS App
```bash
npm run mobile:ios
# In Xcode:
# 1. Select "Any iOS Device"
# 2. Product → Archive
# 3. Follow prompts to upload to App Store
```

## Environment Variables

Create `.env` in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are bundled into the mobile app during build.

## File Locations

```
project/
├── capacitor.config.ts     # Capacitor config
├── android/                # Android native project
├── ios/                    # iOS native project
├── src/
│   ├── mobile.ts          # Mobile initialization
│   └── hooks/
│       └── useMobile.ts   # Mobile features hook
└── dist/                  # Built web assets (synced to mobile)
```

## Resources

- 📚 [Full Mobile Documentation](./MOBILE.md)
- 🔌 [Capacitor Docs](https://capacitorjs.com/docs)
- 📱 [Plugin Marketplace](https://capacitorjs.com/docs/plugins)
- 💬 [Get Help](https://forum.ionicframework.com/c/capacitor/)

---

**Need help?** Check [MOBILE.md](./MOBILE.md) for detailed instructions.
