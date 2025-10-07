# 📁 Project Paths Reference

## 🎯 **Root Project Directory**
```
/Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga
```

## 📱 **React Native Mobile App Paths**

### **iOS Configuration:**
- **Xcode Workspace:** `apps/mobile-app/ios/Thenga.xcworkspace`
- **Xcode Project:** `apps/mobile-app/ios/Thenga.xcodeproj`
- **Scheme:** `Thenga`
- **Bundle ID:** `com.thenga.mobileapp`
- **Export Options:** `apps/mobile-app/ios/ExportOptions.plist`

### **Android Configuration:**
- **Android Project:** `apps/mobile-app/android`
- **Gradle File:** `apps/mobile-app/android/build.gradle`
- **App Gradle:** `apps/mobile-app/android/app/build.gradle`
- **Package Name:** `com.thenga.mobileapp`

### **React Native Source:**
- **Source Directory:** `apps/mobile-app`
- **Package.json:** `apps/mobile-app/package.json`
- **Entry Point:** `apps/mobile-app/index.js`
- **Metro Config:** `apps/mobile-app/metro.config.js`

## 🌐 **PWA Applications**

### **Business PWA:**
- **Source:** `apps/pwa`
- **Build Output:** `apps/pwa/dist`
- **Config:** `apps/pwa/vite.config.ts`

### **Standalone PWA:**
- **Source:** `standalone-pwa`
- **Build Output:** `standalone-pwa/dist`
- **Config:** `standalone-pwa/vite.config.ts`

## 🔧 **CI/CD Configuration Paths**

### **Codemagic:**
```yaml
XCODE_WORKSPACE: "apps/mobile-app/ios/Thenga.xcworkspace"
XCODE_SCHEME: "Thenga"
```

### **Bitrise:**
```yaml
project_path: "apps/mobile-app/ios/Thenga.xcworkspace"
scheme: "Thenga"
```

### **GitHub Actions:**
```yaml
working-directory: apps/mobile-app
```

## 📦 **Build Scripts**

### **iOS Build:**
```bash
cd apps/mobile-app
npm install
cd ios
pod install
cd ..
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle
cd ios
xcodebuild -workspace Thenga.xcworkspace -scheme Thenga -configuration Release
```

### **Android Build:**
```bash
cd apps/mobile-app
npm install
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle
cd android
./gradlew assembleRelease
```

## 🚀 **Deployment Paths**

### **iOS Artifacts:**
- **IPA File:** `apps/mobile-app/ios/build/Thenga.ipa`
- **Archive:** `apps/mobile-app/ios/Thenga.xcarchive`

### **Android Artifacts:**
- **APK File:** `apps/mobile-app/android/app/build/outputs/apk/release/app-release.apk`
- **AAB File:** `apps/mobile-app/android/app/build/outputs/bundle/release/app-release.aab`

## 🔐 **Environment Files**

### **Local Development:**
- **Root:** `.env`
- **Mobile App:** `apps/mobile-app/.env`
- **PWA:** `apps/pwa/.env`

### **CI/CD Variables:**
- **Apple ID:** `$APPLE_ID`
- **App Store Connect API:** `$APP_STORE_CONNECT_API_KEY`
- **Google Play:** `$GOOGLE_PLAY_SERVICE_ACCOUNT`

## 📋 **Quick Reference Commands**

### **Start Development:**
```bash
# Root directory
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga

# Start mobile app
cd apps/mobile-app
npm start

# Start PWA
cd apps/pwa
npm run dev
```

### **Build for Production:**
```bash
# iOS
cd apps/mobile-app
npm run build:ios

# Android
cd apps/mobile-app
npm run build:android

# PWA
cd apps/pwa
npm run build
```

## 🎯 **CI/CD Platform Setup**

### **Codemagic:**
1. Connect repository: `https://github.com/your-username/Thenga`
2. Set working directory: `apps/mobile-app`
3. Configure paths as shown above

### **Bitrise:**
1. Connect repository: `https://github.com/your-username/Thenga`
2. Set project path: `apps/mobile-app/ios/Thenga.xcworkspace`
3. Configure scheme: `Thenga`

### **GitHub Actions:**
1. Repository: `https://github.com/your-username/Thenga`
2. Working directory: `apps/mobile-app`
3. Use the provided workflow files

---

**All paths are relative to your project root: `/Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga`**
