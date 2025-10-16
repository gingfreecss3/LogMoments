# 🚀 Production Build Guide - LogMoments Android

This guide will help you create a production-ready APK for the LogMoments Android app.

## 📋 Prerequisites

- Java Development Kit (JDK) 17 or higher
- Android SDK
- Node.js and npm installed
- Project dependencies installed (`npm install`)

## 🔧 Version Updates

The app version has been updated to **1.0.0** with build code **2**:

- ✅ `package.json`: version set to `1.0.0`
- ✅ `android/app/build.gradle`: versionCode = 2, versionName = "1.0.0"
- ✅ Profile page now displays app version info (visible on mobile devices)

## 🔐 Step 1: Generate Signing Key

First, you need to generate a signing key for your release APK. Run this command in your terminal:

```bash
cd android
keytool -genkey -v -keystore logmoments-release-key.keystore \
  -alias logmoments-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted to enter:
- Keystore password (choose a strong password)
- Key password (can be the same as keystore password)
- Your name, organization, city, state, and country

**⚠️ IMPORTANT**: Keep this keystore file safe! You'll need it for all future app updates.

## 📝 Step 2: Create key.properties File

Create a file at `android/key.properties` with your signing credentials:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=logmoments-key-alias
storeFile=logmoments-release-key.keystore
```

Replace `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD` with the passwords you set in Step 1.

**⚠️ IMPORTANT**: Never commit `key.properties` or the `.keystore` file to git!

## 🏗️ Step 3: Build the Production APK

Now you're ready to build the production APK. You have two options:

### Option 1: Using npm script (Recommended)

```bash
npm run mobile:build:android
```

This command will:
1. Build the web app (`npm run build`)
2. Sync with Capacitor (`npx cap sync`)
3. Build the signed release APK

### Option 2: Manual build

```bash
# Build web app and sync
npm run mobile:sync

# Navigate to android directory and build
cd android
./gradlew assembleRelease
```

## 📦 Step 4: Locate Your APK

After a successful build, your production APK will be located at:

```
android/app/build/outputs/apk/release/app-release.apk
```

You can install this APK on any Android device for testing.

## 📤 Building for Google Play Store (AAB Format)

If you plan to publish to Google Play Store, you should build an Android App Bundle (AAB) instead:

```bash
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔄 Updating for New Releases

When releasing a new version:

1. **Update version numbers**:
   - In `package.json`, increment the `version` field (e.g., from "1.0.0" to "1.1.0")
   - In `android/app/build.gradle`:
     - Increment `versionCode` by 1 (e.g., from 2 to 3)
     - Update `versionName` to match `package.json` (e.g., "1.1.0")

2. **Rebuild**:
   ```bash
   npm run mobile:build:android
   ```

3. **Test the APK** on a device before distributing

## ✅ Verification

To verify your build:

1. Install the APK on an Android device
2. Open the app and navigate to Profile page
3. Check that the app version displays correctly (should show "1.0.0 (build 2)")

## 🛠️ Troubleshooting

### Build fails with "keytool: command not found"
- Install Java JDK 17 or higher
- Ensure `keytool` is in your PATH

### Build fails with signing errors
- Verify `key.properties` exists and has correct values
- Ensure the keystore file path in `key.properties` is correct
- Check that passwords are correct

### APK is unsigned
- Ensure `key.properties` exists in the `android/` directory
- The build process will skip signing if this file is missing

### Gradle build errors
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## 📱 What's New in Version 1.0.0

- ✅ App version display in Profile page
- ✅ Production build configuration with signing support
- ✅ Build script for easy APK generation
- ✅ Updated version numbers across the app
- ✅ Enhanced build documentation

## 🔒 Security Notes

- **Never** commit `key.properties` to version control
- **Never** commit `.keystore` files to version control
- Store your keystore file and passwords securely (use a password manager)
- Make backups of your keystore file
- If you lose your keystore, you cannot update your published app

## 📚 Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Publishing to Google Play](https://developer.android.com/studio/publish)

---

**Happy Building! 🎉**
