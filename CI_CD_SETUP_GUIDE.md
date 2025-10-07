# 🚀 CI/CD Setup Guide for React Native

This guide will help you set up automated building, testing, and deployment for your React Native app using Codemagic, Bitrise, or GitHub Actions.

## 📋 Prerequisites

1. **Apple Developer Account** (for iOS)
2. **Google Play Console Account** (for Android)
3. **GitHub Repository** (for GitHub Actions)
4. **App Store Connect API Key** (for automated uploads)

## 🔧 Setup Options

### Option 1: Codemagic (Recommended for React Native)

#### Step 1: Connect Repository
1. Go to [codemagic.io](https://codemagic.io)
2. Sign up with GitHub/GitLab/Bitbucket
3. Connect your repository
4. Codemagic will auto-detect your React Native project

#### Step 2: Configure Environment Variables
In Codemagic dashboard, add these encrypted variables:

```
APPLE_ID=your-apple-id@example.com
APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
APP_STORE_CONNECT_ISSUER_ID=your-issuer-id
APP_STORE_CONNECT_KEY_IDENTIFIER=your-key-identifier
APP_STORE_CONNECT_PRIVATE_KEY=your-private-key
```

#### Step 3: Upload App Store Connect API Key
1. Download your App Store Connect API key (.p8 file)
2. Upload it to Codemagic's secure file storage
3. Reference it in your `codemagic.yaml`

#### Step 4: Test the Build
1. Push to your main branch
2. Codemagic will automatically start building
3. Check the build logs for any issues

### Option 2: Bitrise

#### Step 1: Connect Repository
1. Go to [bitrise.io](https://bitrise.io)
2. Sign up and connect your repository
3. Bitrise will auto-detect your React Native project

#### Step 2: Configure Workflow
1. Use the provided `bitrise.yml` configuration
2. Add your Apple Developer credentials
3. Configure iOS Code Signing step

#### Step 3: Set Environment Variables
Add these in Bitrise dashboard:

```
APPLE_ID=your-apple-id@example.com
APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
APPLE_APP_ID=1234567890
```

### Option 3: GitHub Actions

#### Step 1: Add Secrets
In your GitHub repository, go to Settings > Secrets and add:

```
APPLE_ISSUER_ID=your-issuer-id
APPLE_API_KEY_ID=your-key-identifier
APPLE_API_PRIVATE_KEY=your-private-key
GOOGLE_PLAY_SERVICE_ACCOUNT=your-service-account-json
```

#### Step 2: Enable Actions
1. Go to Actions tab in your repository
2. Enable GitHub Actions
3. The workflow will run automatically on push/PR

## 🔐 Apple Developer Setup

### 1. Create App Store Connect API Key
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Users and Access > Keys > App Store Connect API
3. Generate a new key with "Developer" role
4. Download the .p8 file
5. Note the Key ID and Issuer ID

### 2. Create App-Specific Password
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in with your Apple ID
3. App-Specific Passwords > Generate Password
4. Use this password for CI/CD

### 3. Configure Code Signing
- **Automatic**: Let the CI service handle it
- **Manual**: Upload certificates and provisioning profiles

## 📱 Android Setup

### 1. Google Play Console
1. Create a new app in [Google Play Console](https://play.google.com/console)
2. Set up app signing
3. Create a service account with "Release Manager" role

### 2. Service Account JSON
1. Download the service account JSON file
2. Add it to your CI/CD environment variables
3. Configure the publishing step

## 🚀 Deployment Workflow

### Automatic Deployment
- **TestFlight**: Every build goes to TestFlight automatically
- **App Store**: Manual submission from TestFlight
- **Google Play**: Automatic upload to Internal Testing track

### Manual Deployment
- Download .ipa/.aab files from CI/CD artifacts
- Upload manually to App Store Connect/Google Play Console

## 🔍 Troubleshooting

### Common Issues

1. **Code Signing Errors**
   - Check Apple Developer account access
   - Verify certificates and provisioning profiles
   - Ensure Team ID is correct

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check iOS/Android build requirements

3. **Upload Failures**
   - Verify App Store Connect API key
   - Check app-specific password
   - Ensure app exists in App Store Connect

### Debug Steps

1. **Check Build Logs**
   - Review CI/CD build logs for errors
   - Look for specific error messages
   - Check environment variables

2. **Test Locally**
   - Run `npm install` and `pod install`
   - Test iOS build with Xcode
   - Test Android build with Gradle

3. **Verify Configuration**
   - Check all environment variables
   - Verify API keys and certificates
   - Test with a simple build first

## 📊 Monitoring

### Build Status
- Monitor build success/failure rates
- Set up notifications for build failures
- Track deployment success

### App Store Analytics
- Monitor TestFlight feedback
- Track crash reports
- Monitor app performance

## 🎯 Next Steps

1. **Set up monitoring** for build failures
2. **Configure notifications** for team members
3. **Set up staging environment** for testing
4. **Implement feature flags** for gradual rollouts
5. **Set up crash reporting** (Firebase Crashlytics)

## 📞 Support

- **Codemagic**: [docs.codemagic.io](https://docs.codemagic.io)
- **Bitrise**: [devcenter.bitrise.io](https://devcenter.bitrise.io)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

---

**Your React Native app is now ready for automated CI/CD! 🎉**
