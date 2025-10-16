# 🎨 App Icons & Splash Screens Guide

This guide explains how to add custom app icons and splash screens for your mobile app.

## Quick Setup with Capacitor Assets (Recommended)

### 1. Install Capacitor Assets

```bash
npm install -g @capacitor/assets
```

### 2. Prepare Your Images

Create two images in the **project root directory**:

#### App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Background**: Can be transparent
- **Design**: Should look good when rounded (Android) and squared (iOS)

#### Splash Screen (`splash.png`)
- **Size**: 2732x2732 pixels (or at least 2048x2048)
- **Format**: PNG
- **Background**: Solid color recommended (matches your app theme)
- **Safe zone**: Keep important content in the center 1200x1200px area

### 3. Generate Assets

```bash
npx @capacitor/assets generate
```

This will automatically create all required icon and splash screen sizes for both Android and iOS.

### 4. Sync Changes

```bash
npm run mobile:sync
```

## Manual Setup

### Android Icons

#### Standard Icons
Place icons in `android/app/src/main/res/`:

```
mipmap-mdpi/ic_launcher.png        48x48
mipmap-hdpi/ic_launcher.png        72x72
mipmap-xhdpi/ic_launcher.png       96x96
mipmap-xxhdpi/ic_launcher.png      144x144
mipmap-xxxhdpi/ic_launcher.png     192x192
```

#### Round Icons (Android 7.1+)
```
mipmap-mdpi/ic_launcher_round.png     48x48
mipmap-hdpi/ic_launcher_round.png     72x72
mipmap-xhdpi/ic_launcher_round.png    96x96
mipmap-xxhdpi/ic_launcher_round.png   144x144
mipmap-xxxhdpi/ic_launcher_round.png  192x192
```

#### Foreground Icons (Android 8.0+ Adaptive Icons)
```
mipmap-mdpi/ic_launcher_foreground.png     108x108
mipmap-hdpi/ic_launcher_foreground.png     162x162
mipmap-xhdpi/ic_launcher_foreground.png    216x216
mipmap-xxhdpi/ic_launcher_foreground.png   324x324
mipmap-xxxhdpi/ic_launcher_foreground.png  432x432
```

### Android Splash Screens

Place splash screens in `android/app/src/main/res/`:

```
drawable/splash.png              (base)
drawable-mdpi/splash.png         480x800
drawable-hdpi/splash.png         720x1280
drawable-xhdpi/splash.png        960x1600
drawable-xxhdpi/splash.png       1440x2560
drawable-xxxhdpi/splash.png      1920x3200
```

To customize the splash screen:
1. Edit `android/app/src/main/res/values/styles.xml`
2. Modify the splash screen background color
3. Adjust the splash screen layout in `android/app/src/main/res/drawable/splash.xml`

### iOS Icons

Update icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required sizes:
```
20x20     (Notification, iPhone, iPad)
29x29     (Settings, iPhone, iPad)
40x40     (Spotlight, iPhone, iPad)
60x60     (iPhone App)
76x76     (iPad App)
83.5x83.5 (iPad Pro App)
1024x1024 (App Store)
```

Each size needs 2x and 3x versions:
- Icon-20@2x.png (40x40)
- Icon-20@3x.png (60x60)
- Icon-29@2x.png (58x58)
- etc.

### iOS Splash Screens

Update splash screens in `ios/App/App/Assets.xcassets/Splash.imageset/`

Or use Launch Screen Storyboard:
1. Open `ios/App/App.xcodeproj` in Xcode
2. Select `LaunchScreen.storyboard`
3. Customize the launch screen design

## Design Tips

### App Icon
- **Simple and recognizable**: Works well at small sizes
- **No text**: Text is hard to read at small sizes
- **Consistent branding**: Matches your app's color scheme
- **High contrast**: Stands out on home screen
- **Safe margins**: Keep important content away from edges

### Splash Screen
- **Fast loading**: Splash screen shows briefly
- **Brand representation**: Shows your logo/brand
- **Simple design**: Don't overload with information
- **Match theme**: Use your app's primary colors
- **Center content**: Safe zone in the middle 1200x1200px

## Color Scheme for LogMoments

Based on the app's design:

```
Primary Color:   #8b5cf6 (Purple)
Secondary Color: #3b82f6 (Blue)
Background:      #fafafa (Neutral Gray)
Text:            #171717 (Dark Gray)
```

### Suggested Icon Design
- Purple gradient background (#8b5cf6 to #3b82f6)
- White heart or journal icon in center
- Rounded corners for modern look

### Suggested Splash Screen
- White background (#ffffff)
- Purple gradient logo in center
- "LogMoments" text below (optional)

## Tools for Creating Assets

### Free Tools
- **Figma** - https://figma.com (Vector design)
- **GIMP** - https://gimp.org (Image editing)
- **Inkscape** - https://inkscape.org (Vector graphics)

### Online Generators
- **App Icon Generator** - https://appicon.co
- **Icon Kitchen** - https://icon.kitchen
- **Ape Tools** - https://apetools.webprofusion.com

### Paid Tools
- **Adobe Illustrator** - Professional vector design
- **Sketch** - macOS design tool
- **Affinity Designer** - One-time purchase design tool

## Verification

### Android
1. Build and install the app
2. Check the home screen for the icon
3. Launch the app to see the splash screen

### iOS
1. Build and install the app
2. Check the home screen for the icon
3. Launch the app to see the splash screen
4. In Xcode, verify in Asset Catalog

## Testing Different Screen Sizes

### Android
Test on various emulators:
- Phone: Pixel 7, Samsung Galaxy S23
- Tablet: Nexus 10, Samsung Galaxy Tab
- Different densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

### iOS
Test on various simulators:
- iPhone: 14, 14 Pro, SE
- iPad: iPad Pro, iPad Air
- Different screen sizes: 4.7", 5.5", 6.1", 6.7"

## Troubleshooting

### Icon not updating
```bash
# Android
cd android
./gradlew clean
cd ..
npm run mobile:sync

# iOS
rm -rf ios/App/Pods
cd ios/App
pod install
cd ../..
npm run mobile:sync
```

### Splash screen not showing
- Check `capacitor.config.ts` splash screen settings
- Verify splash images exist in correct directories
- Ensure splash screen plugin is installed

### Wrong icon displaying
- Clear app cache on device
- Uninstall and reinstall the app
- Verify icon files are in correct directories

## App Store Assets

### Google Play Store
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: Various phone/tablet sizes
- **Promotional graphics**: Optional

### Apple App Store
- **App Icon**: 1024x1024 PNG (no transparency)
- **Screenshots**: Required for each device size
- **App Preview**: Optional video

## Resources

- [Capacitor Assets Plugin](https://github.com/ionic-team/capacitor-assets)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Material Design Icons](https://material.io/design/iconography)
- [SF Symbols (iOS)](https://developer.apple.com/sf-symbols/)

---

**Pro Tip**: Use vector graphics (SVG) for your original design, then export to PNG at required sizes for best quality.
