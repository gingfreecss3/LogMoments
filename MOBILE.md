# 📱 LogMoments Mobile App

This document provides instructions for building and running the LogMoments native mobile app on iOS and Android using Capacitor.

## 📋 Prerequisites

### For Android Development
- [Android Studio](https://developer.android.com/studio) (latest version)
- Android SDK (API Level 22 or higher)
- Java Development Kit (JDK) 17 or higher

### For iOS Development
- macOS (required for iOS development)
- [Xcode](https://developer.apple.com/xcode/) (latest version)
- iOS Simulator or physical iOS device
- CocoaPods (`sudo gem install cocoapods`)

### General Requirements
- Node.js (v18 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

Before running on mobile, you need to build the web assets:

```bash
npm run build
```

### 3. Sync with Native Platforms

Sync the web build with native platforms:

```bash
npx cap sync
```

## 📱 Running on Android

### Option 1: Open in Android Studio

```bash
npm run mobile:android
```

This will:
1. Build the web app
2. Sync with Android
3. Open the project in Android Studio

Then in Android Studio:
- Click the "Run" button (green play icon)
- Select your emulator or connected device
- The app will build and launch

### Option 2: Run Directly

If you have the Android SDK configured in your PATH:

```bash
npm run mobile:run:android
```

### Option 3: Manual Process

```bash
# Build and sync
npm run mobile:sync

# Open Android Studio
npx cap open android

# Or use Android Studio directly
cd android
./gradlew assembleDebug
```

## 🍎 Running on iOS

### Option 1: Open in Xcode

```bash
npm run mobile:ios
```

This will:
1. Build the web app
2. Sync with iOS
3. Open the project in Xcode

Then in Xcode:
- Select your target device or simulator
- Click the "Run" button (play icon)
- The app will build and launch

### Option 2: Run Directly

```bash
npm run mobile:run:ios
```

### Option 3: Manual Process

```bash
# Build and sync
npm run mobile:sync

# Install CocoaPods dependencies (first time only)
cd ios/App
pod install

# Open Xcode
cd ../..
npx cap open ios
```

## 🔄 Development Workflow

When making changes to the web app:

1. Make your code changes in `src/`
2. Build the web app: `npm run build`
3. Sync with platforms: `npx cap sync`
4. The native apps will automatically reload with the changes

For live reload during development, you can use:

```bash
# In one terminal, start the dev server
npm run dev

# In another terminal, configure live reload
npx cap run android --livereload --external
# or
npx cap run ios --livereload --external
```

## 📦 Building for Production

### Android

#### Debug APK

```bash
cd android
./gradlew assembleDebug
# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK/AAB

1. Generate a signing key:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/key.properties`:
```properties
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=my-key-alias
storeFile=../my-release-key.keystore
```

3. Build release:
```bash
cd android
./gradlew assembleRelease
# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

For Google Play Store, build an AAB:
```bash
./gradlew bundleRelease
# AAB will be at: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS

1. Open the project in Xcode:
```bash
npm run mobile:ios
```

2. Select "Any iOS Device" as the build target
3. Go to Product > Archive
4. Once archived, follow the Xcode Organizer to upload to App Store Connect

## 🔧 Configuration

### App Configuration

Edit `capacitor.config.ts` to modify:
- App ID (`appId`)
- App Name (`appName`)
- Plugin configurations

### Android Configuration

Key files:
- `android/app/src/main/AndroidManifest.xml` - Permissions and app metadata
- `android/app/build.gradle` - Build configuration
- `android/app/src/main/res/values/strings.xml` - App name and strings

### iOS Configuration

Key files:
- `ios/App/App/Info.plist` - Permissions and app metadata
- `ios/App/App.xcodeproj/project.pbxproj` - Project configuration

## 🎨 App Icons & Splash Screens

### Generate Assets

Use [Capacitor Assets](https://github.com/ionic-team/capacitor-assets) to generate icons and splash screens:

```bash
npm install -g @capacitor/assets
```

Place your icon (icon.png) and splash screen (splash.png) in the root:
- `icon.png` - 1024x1024px PNG with transparency
- `splash.png` - 2732x2732px PNG

Then run:
```bash
npx capacitor-assets generate
```

### Manual Setup

#### Android Icons
Place icons in `android/app/src/main/res/`:
- `mipmap-hdpi/ic_launcher.png` - 72x72
- `mipmap-mdpi/ic_launcher.png` - 48x48
- `mipmap-xhdpi/ic_launcher.png` - 96x96
- `mipmap-xxhdpi/ic_launcher.png` - 144x144
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192

#### iOS Icons
Update assets in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

## 🔌 Capacitor Plugins

The app includes these Capacitor plugins:

- **@capacitor/app** - App state, deep linking, and back button handling
- **@capacitor/haptics** - Haptic feedback for better UX
- **@capacitor/keyboard** - Keyboard behavior and events
- **@capacitor/status-bar** - Status bar styling
- **@capacitor/splash-screen** - Splash screen management

### Adding More Plugins

```bash
npm install @capacitor/[plugin-name]
npx cap sync
```

Popular plugins:
- `@capacitor/camera` - Camera and photo library
- `@capacitor/filesystem` - File system access
- `@capacitor/share` - Native share functionality
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Push notifications

## 🐛 Debugging

### Android

Use Chrome DevTools:
1. Open Chrome and navigate to `chrome://inspect`
2. Connect your device or start emulator
3. Find your app in the list and click "Inspect"

Or use Android Studio Logcat:
```bash
adb logcat
```

### iOS

Use Safari Web Inspector:
1. Enable Web Inspector on your iOS device (Settings > Safari > Advanced)
2. Connect your device
3. Open Safari > Develop > [Your Device] > [Your App]

Or use Xcode console:
- In Xcode, go to View > Debug Area > Activate Console

## 🧪 Testing

### Testing on Real Devices

#### Android
1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect via USB
4. Run `npm run mobile:run:android`

#### iOS
1. Connect your device
2. In Xcode, select your device from the device list
3. Click Run
4. You may need to trust the developer certificate on your device

### Testing on Emulators/Simulators

#### Android Emulator
Create and manage emulators in Android Studio (AVD Manager)

#### iOS Simulator
Comes with Xcode - select from device list in Xcode

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These will be bundled into the mobile app during build.

## 🔒 Security Considerations

1. **Never commit sensitive keys** - Use `.env` for secrets
2. **Enable SSL Pinning** - For production apps
3. **Obfuscate Code** - Use ProGuard for Android
4. **Use App Transport Security** - Enabled by default on iOS
5. **Implement Biometric Auth** - For sensitive data

## 🆘 Common Issues

### Android

**Issue**: Gradle build fails
```bash
cd android
./gradlew clean
./gradlew build
```

**Issue**: SDK not found
- Set `ANDROID_HOME` environment variable
- Update `local.properties` in `android/` folder

### iOS

**Issue**: CocoaPods errors
```bash
cd ios/App
pod deintegrate
pod install
```

**Issue**: Code signing errors
- Ensure you have a valid Apple Developer account
- Configure signing in Xcode project settings

### General

**Issue**: Changes not appearing
```bash
npm run build
npx cap sync
```

**Issue**: Plugin not working
```bash
npm install
npx cap sync
```

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)

## 🎯 Next Steps

1. **Test on real devices** - Always test on actual hardware
2. **Configure app signing** - Set up proper certificates
3. **Add native features** - Integrate device capabilities
4. **Optimize performance** - Profile and improve loading times
5. **Submit to stores** - Follow Google Play and App Store guidelines

---

**Made with 💜 for mobile moments**
