# 🚀 Thenga iOS App Store Deployment Guide

## Overview
This guide will help you deploy your Thenga PWA and create an iOS app for the App Store using the PWA wrapper approach.

## 📋 Prerequisites
- Apple Developer Account ($99/year)
- Xcode installed on your Mac
- Your Thenga PWA ready for deployment
- Domain hosting (for PWA deployment)

## 🎯 Step-by-Step Process

### Step 1: Deploy Your Thenga PWA

#### Option A: Deploy to Firebase Hosting (Recommended)
```bash
# Navigate to your PWA directory
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/apps/pwa

# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init hosting

# Deploy to Firebase
firebase deploy
```

#### Option B: Deploy to Your Own Domain
```bash
# Run the deployment script
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/apps/pwa
chmod +x deploy-customer-to-domain.sh
./deploy-customer-to-domain.sh
```

### Step 2: Configure Xcode Project

1. **Open Xcode Project:**
   ```bash
   cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/appstore_screenshots/Thenga/src
   open Thenga.xcworkspace
   ```

2. **Configure Bundle Identifier:**
   - Select "Thenga" project in Xcode
   - Go to "Signing & Capabilities"
   - Set Bundle Identifier: `com.yourcompany.thenga` (replace with your company)
   - Select your Apple Developer Team

3. **Update App Information:**
   - Display Name: "Thenga"
   - Version: "1.0.0"
   - Build: "1"

### Step 3: Configure PWA URL

The Xcode project is already configured to load:
- **URL:** `https://thenga.mozdev.co.za`
- **Allowed Origins:** `thenga.mozdev.co.za`

If you deployed to a different URL, update `Settings.swift`:
```swift
let rootUrl = URL(string: "https://your-actual-domain.com")!
let allowedOrigins: [String] = ["your-actual-domain.com"]
```

### Step 4: Build and Test

1. **Build for Simulator:**
   - Select a simulator (iPhone 15 Pro recommended)
   - Press Cmd+R to build and run
   - Test the app functionality

2. **Build for Device:**
   - Connect your iPhone via USB
   - Select your device in Xcode
   - Build and run on device
   - Test all features

### Step 5: Prepare for App Store

1. **App Icons:**
   - The project includes app icons in `Assets.xcassets/AppIcon.appiconset/`
   - Ensure all required sizes are present

2. **Launch Screen:**
   - Configured in `LaunchScreen.storyboard`
   - Should match your PWA's branding

3. **App Store Metadata:**
   - App Name: "Thenga"
   - Subtitle: "Digital Commerce Platform"
   - Description: "Thenga - Digital commerce platform for micro and small businesses in South Africa"
   - Keywords: "commerce, business, ecommerce, south africa"
   - Category: "Business"

### Step 6: Archive and Upload

1. **Archive the App:**
   - Select "Any iOS Device" as target
   - Go to Product → Archive
   - Wait for archive to complete

2. **Upload to App Store Connect:**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow the upload process

3. **App Store Connect Configuration:**
   - Add app screenshots
   - Write app description
   - Set pricing and availability
   - Submit for review

## 🔧 Technical Configuration

### Firebase Integration
The app includes Firebase for push notifications:
- `GoogleService-Info.plist` is included
- Push notification handling in `PushNotifications.swift`
- Update Firebase project settings as needed

### App Capabilities
- **Push Notifications:** ✅ Configured
- **Background Processing:** ✅ Configured
- **App Transport Security:** ✅ Configured
- **WebView Integration:** ✅ Configured

### Security Features
- App-bound domains for security
- HTTPS enforcement
- Secure cookie handling
- File download support

## 📱 App Features

### Native iOS Features
- ✅ Push Notifications
- ✅ Background Processing
- ✅ File Downloads
- ✅ Print Support
- ✅ Share Functionality
- ✅ App Store Distribution

### PWA Features
- ✅ Offline Support
- ✅ Installable
- ✅ Responsive Design
- ✅ Cross-Platform Compatibility

## 🚨 Important Notes

1. **Domain Requirements:**
   - Your PWA must be accessible at the configured URL
   - HTTPS is required
   - Proper SSL certificate needed

2. **App Store Guidelines:**
   - Ensure your PWA follows Apple's guidelines
   - No broken links or missing content
   - Proper error handling

3. **Testing:**
   - Test on multiple devices
   - Test offline functionality
   - Test all user flows

## 🎉 Success Checklist

- [ ] PWA deployed and accessible
- [ ] Xcode project configured
- [ ] App builds successfully
- [ ] App runs on device
- [ ] All features working
- [ ] App archived successfully
- [ ] Uploaded to App Store Connect
- [ ] App Store metadata complete
- [ ] Submitted for review

## 📞 Support

If you encounter issues:
1. Check Xcode console for errors
2. Verify PWA is accessible in browser
3. Ensure all certificates are valid
4. Check Apple Developer account status

---

**Ready to launch Thenga on the App Store! 🚀**
