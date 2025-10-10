# Thenga Mobile App

React Native mobile application for iOS and Android with native Xcode project integration.

## 📱 Features

- **Cross-Platform**: iOS and Android support
- **Native Performance**: React Native with native modules
- **Offline-First**: Works during loadshedding and internet outages
- **Camera Integration**: QR code scanning and product photos
- **Push Notifications**: Real-time order updates
- **Biometric Auth**: Touch ID / Face ID support
- **WhatsApp Integration**: Native WhatsApp sharing and messaging

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

1. **Install dependencies**
```bash
cd apps/mobile-app
npm install
```

2. **iOS Setup**
```bash
cd ios
pod install
cd ..
```

3. **Start Metro bundler**
```bash
npm start
```

### Running the App

**iOS Simulator**
```bash
npm run ios
# or
npx react-native run-ios
```

**Android Emulator**
```bash
npm run android
# or
npx react-native run-android
```

**Physical Device**
```bash
# iOS
npx react-native run-ios --device

# Android
npx react-native run-android --device
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API and external services
├── store/              # State management (Zustand)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── assets/             # Images, fonts, etc.
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
API_BASE_URL=https://api.Thenga.co.za
WHATSAPP_API_URL=https://api.whatsapp.com
PAYMENT_PROVIDER_URL=https://api.payfast.co.za
```

### iOS Configuration

The iOS app is configured with:
- **Bundle ID**: `com.Thenga.mobile`
- **Deployment Target**: iOS 11.0+
- **Permissions**: Camera, Location, Contacts, Microphone
- **Capabilities**: Push Notifications, Background Modes

### Android Configuration

The Android app is configured with:
- **Package**: `com.Thenga.mobile`
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Permissions**: Camera, Location, Contacts, etc.

## 🚀 Build & Deployment

### iOS Build

1. **Development Build**
```bash
npx react-native run-ios --configuration Debug
```

2. **Release Build**
```bash
npx react-native run-ios --configuration Release
```

3. **Archive for App Store**
```bash
# Open Xcode
open ios/Thenga.xcworkspace
# Archive in Xcode
```

### Android Build

1. **Debug APK**
```bash
cd android
./gradlew assembleDebug
```

2. **Release APK**
```bash
cd android
./gradlew assembleRelease
```

3. **AAB for Play Store**
```bash
cd android
./gradlew bundleRelease
```

## 📱 Key Features Implementation

### Offline Support
- SQLite database for local storage
- Sync manager for data synchronization
- Offline queue for actions
- Network status monitoring

### Camera Integration
- QR code scanning for payments
- Product photo capture
- Image picker for gallery selection
- Camera permissions handling

### Push Notifications
- Firebase Cloud Messaging
- Local notifications
- Background processing
- Notification permissions

### WhatsApp Integration
- Native sharing
- Deep linking
- Template messages
- Contact integration

## 🔒 Security

- **Biometric Authentication**: Touch ID / Face ID
- **Secure Storage**: Keychain / Keystore
- **Certificate Pinning**: API security
- **Data Encryption**: Sensitive data protection

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# iOS tests
npm run test:ios

# Android tests
npm run test:android
```

## 📊 Performance

- **Bundle Size**: Optimized for mobile
- **Memory Usage**: Efficient state management
- **Battery Life**: Background task optimization
- **Network**: Request caching and batching

## 🐛 Debugging

### React Native Debugger
```bash
npm install -g react-native-debugger
react-native-debugger
```

### Flipper
- iOS: Automatically configured
- Android: Enable in developer options

### Console Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

## 📦 Dependencies

### Core
- React Native 0.72+
- React Navigation 6+
- React Query 3+
- Zustand 4+

### UI
- React Native Paper
- React Native Elements
- React Native Vector Icons

### Native Modules
- React Native Camera
- React Native Permissions
- React Native Keychain
- React Native Async Storage

## 🚀 Deployment

### App Store (iOS)
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

### Play Store (Android)
1. Generate signed AAB
2. Upload to Play Console
3. Submit for review

## 📞 Support

For development issues:
- Check React Native documentation
- Review iOS/Android specific guides
- Contact development team

---

**Built with ❤️ for South African businesses**
