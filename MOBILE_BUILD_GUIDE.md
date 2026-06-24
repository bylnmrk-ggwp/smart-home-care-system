# Mobile App Build Guide

Your Smart Home Care app has been converted to a mobile app using Capacitor. Here's how to build and install it on your devices.

## Project Structure

- `android/` - Android native project
- `ios/` - iOS native project
- `capacitor.config.ts` - Capacitor configuration

## Building for Android

### Prerequisites
- Android Studio installed
- Android SDK (API level 33+)
- Java Development Kit (JDK) 17+

### Steps

1. **Open Android Project**
   ```bash
   npm run android:open
   ```
   This will open the project in Android Studio.

2. **Build APK**
   - In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Wait for the build to complete
   - Click "locate" in the notification to find the APK

3. **APK Location**
   The APK file will be at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Install on Device**
   - Transfer the APK to your Android device
   - Enable "Install from unknown sources" in settings
   - Open the APK file to install

### Building Release APK
- In Android Studio: **Build > Generate Signed Bundle / APK**
- Follow the signing wizard to create a keystore
- Choose "APK" and "release" build type
- The release APK will be in `android/app/build/outputs/apk/release/`

## Building for iOS (macOS only)

### Prerequisites
- macOS computer
- Xcode installed (latest version)
- Apple Developer Account (for App Store distribution)

### Steps

1. **Open iOS Project**
   ```bash
   npm run ios:open
   ```
   This will open the project in Xcode.

2. **Select Target Device**
   - Choose your connected iPhone/iPad or iOS Simulator
   - In the top toolbar, select your device

3. **Build and Run**
   - Press **Cmd + R** or click the Play button
   - The app will build and install on your device/simulator

4. **Create IPA for Distribution**
   - In Xcode: **Product > Archive**
   - Wait for archiving to complete
   - The Organizer window will appear
   - Choose distribution method (App Store, Ad Hoc, Enterprise)
   - Follow the prompts to export the IPA file

## Quick Development Workflow

When you make changes to your React code:

1. **Build the web app**
   ```bash
   npm run build
   ```

2. **Sync to native platforms**
   ```bash
   # For Android
   npm run android:sync
   
   # For iOS
   npm run ios:sync
   ```

3. **Rebuild in Android Studio/Xcode**

## Testing on Emulator/Simulator

### Android Emulator
1. Open Android Studio
2. Create an AVD (Android Virtual Device) if you don't have one
3. Run the app from Android Studio

### iOS Simulator
1. Open Xcode
2. Select a simulator from the device dropdown
3. Press Cmd + R to run

## Troubleshooting

### Build Errors
- Make sure you have the latest Android SDK and build tools
- Run `npm run android:sync` after making changes
- Clean build: In Android Studio: **Build > Clean Project**

### iOS Signing Issues
- Make sure you have a valid Apple Developer account
- Configure signing in Xcode: **Project Settings > Signing & Capabilities**
- For development, use your personal team for automatic signing

## App Configuration

Edit `capacitor.config.ts` to change:
- App name
- App ID (bundle identifier)
- Web server URL
- Plugins and permissions

## Next Steps

- Add app icons and splash screens
- Configure app permissions (camera, storage, etc.)
- Set up push notifications if needed
- Test on real devices before distribution
