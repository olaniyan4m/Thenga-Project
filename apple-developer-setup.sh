#!/bin/bash

# Apple Developer Account Setup for Thenga Project
# Run these commands in your terminal to configure your project

echo "🍎 Apple Developer Account Setup for Thenga"
echo "=========================================="

# 1. Navigate to the correct directory
echo "1. Navigate to the iOS project directory:"
echo "   cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/apps/mobile-app/ios"
echo ""

# 2. Verify your certificates
echo "2. Verify your certificates (already done - you have a valid identity):"
echo "   ✅ Apple Development: m.olaniyan@icloud.com (46QVZAC55D)"
echo ""

# 3. Check your certificates
echo "3. Check your certificates:"
echo "   Run this command to see your certificates:"
echo ""
echo "   security find-identity -v -p codesigning"
echo ""

# 4. Configure Xcode project for App Store
echo "4. Configure Xcode project for App Store distribution:"
echo "   Navigate to your iOS project directory:"
echo ""
echo "   cd apps/mobile-app/ios"
echo ""

# 5. Set up automatic signing
echo "5. Set up automatic signing in Xcode:"
echo "   Open Xcode and configure:"
echo "   - Open Thenga.xcodeproj in Xcode"
echo "   - Select the project in the navigator"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - Check 'Automatically manage signing'"
echo "   - Select your team: Olaniyan Mayowa (YJJA9A296N)"
echo "   - Set Bundle Identifier to: com.thenga.commerce"
echo ""

# 6. Archive and export for App Store
echo "6. Archive and export for App Store:"
echo "   Run these commands to create an App Store build:"
echo ""
echo "   # Clean and archive"
echo "   xcodebuild clean -project Thenga.xcodeproj -scheme Thenga"
echo "   xcodebuild archive -project Thenga.xcodeproj -scheme Thenga -archivePath Thenga.xcarchive"
echo ""
echo "   # Export for App Store"
echo "   xcodebuild -exportArchive -archivePath Thenga.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist"
echo ""

# 7. Upload to App Store Connect
echo "7. Upload to App Store Connect:"
echo "   Run this command to upload your IPA (using notarytool):"
echo ""
echo "   xcrun notarytool submit build/Thenga.ipa --apple-id m.olaniyan@icloud.com --password [APP_SPECIFIC_PASSWORD] --team-id YJJA9A296N --wait"
echo "   # Note: Replace [APP_SPECIFIC_PASSWORD] with your App Store Connect app-specific password"
echo ""

# 8. App Store Connect setup
echo "8. App Store Connect Setup:"
echo "   Go to: https://appstoreconnect.apple.com"
echo "   - Sign in with: m.olaniyan@icloud.com"
echo "   - Create a new app with Bundle ID: com.thenga.commerce"
echo "   - Set SKU: thenga-mobile-2025"
echo "   - Configure app information and screenshots"
echo ""

echo "✅ Setup complete! Your project is ready for App Store submission."
echo ""
echo "📱 Next steps:"
echo "   1. Run the commands above in your terminal"
echo "   2. Configure your app in App Store Connect"
echo "   3. Upload your IPA file"
echo "   4. Submit for review"
