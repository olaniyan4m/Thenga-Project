#!/bin/bash

# 🚀 Pezela Production Build Script
# This script builds the mobile app for App Store submission

set -e

echo "🚀 Starting Pezela Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Set environment
export NODE_ENV=production
export APP_ENV=production

print_status "Setting up production environment..."

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Build React Native app
print_status "Building React Native app..."

cd apps/mobile-app

# Clean previous builds
print_status "Cleaning previous builds..."
npx react-native clean

# Install iOS dependencies
print_status "Installing iOS dependencies..."
cd ios
pod install
cd ..

# Build for iOS (App Store)
print_status "Building iOS app for App Store..."
npx react-native run-ios --configuration Release --device

# Build for Android (Play Store)
print_status "Building Android app for Play Store..."
cd android
./gradlew assembleRelease
./gradlew bundleRelease
cd ..

print_success "Production builds completed!"

# Create production artifacts
print_status "Creating production artifacts..."

# iOS App Store Archive
if [ -d "ios/build/Build/Products/Release-iphoneos/Pezela.app" ]; then
    print_status "Creating iOS App Store archive..."
    cd ios
    xcodebuild -workspace Pezela.xcworkspace -scheme Pezela -configuration Release -destination generic/platform=iOS -archivePath Pezela.xcarchive archive
    print_success "iOS archive created: ios/Pezela.xcarchive"
    cd ..
else
    print_warning "iOS app not found. Make sure iOS build completed successfully."
fi

# Android APK and AAB
if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
    print_success "Android APK created: android/app/build/outputs/apk/release/app-release.apk"
else
    print_warning "Android APK not found. Make sure Android build completed successfully."
fi

if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
    print_success "Android AAB created: android/app/build/outputs/bundle/release/app-release.aab"
else
    print_warning "Android AAB not found. Make sure Android build completed successfully."
fi

print_success "🎉 Production build process completed!"

echo ""
echo "📱 Next steps for App Store submission:"
echo "1. Open ios/Pezela.xcworkspace in Xcode"
echo "2. Select 'Any iOS Device' as destination"
echo "3. Product → Archive"
echo "4. Upload to App Store Connect"
echo ""
echo "📱 Next steps for Play Store submission:"
echo "1. Go to Google Play Console"
echo "2. Create new release"
echo "3. Upload android/app/build/outputs/bundle/release/app-release.aab"
echo "4. Fill out release notes and submit for review"
echo ""
echo "🔗 Useful links:"
echo "- App Store Connect: https://appstoreconnect.apple.com"
echo "- Google Play Console: https://play.google.com/console"
echo "- Pezela Production API: https://api.pezela.co.za"
