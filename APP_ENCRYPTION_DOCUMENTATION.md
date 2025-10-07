# App Encryption Documentation - Thenga

## App Information
- **App Name:** Thenga
- **Bundle ID:** com.thenga.commerce
- **Version:** 1.0

## Encryption Usage Declaration

**ITSAppUsesNonExemptEncryption: false**

## Encryption Analysis

### Standard Encryption Used (Exempt)
Our app uses only standard, exempt encryption methods:

1. **HTTPS/TLS Encryption**
   - Standard SSL/TLS protocols for secure communication
   - Used for API calls to backend services
   - Standard implementation provided by iOS networking frameworks

2. **iOS System Encryption**
   - Keychain Services for secure credential storage
   - iOS built-in encryption for local data protection
   - Standard iOS security frameworks

3. **Standard Web Technologies**
   - HTTPS for web content loading
   - Standard browser security protocols
   - No custom encryption implementations

### No Non-Exempt Encryption
The app does NOT use:
- Proprietary encryption algorithms
- Custom encryption implementations
- Non-standard encryption methods
- Encryption beyond standard iOS system capabilities

### Compliance Statement
This app complies with Apple's encryption requirements by:
- Using only standard, exempt encryption methods
- Relying on iOS system-provided security features
- Not implementing custom encryption algorithms
- Following standard web security practices

## Technical Implementation

### Network Security
- All API communications use HTTPS/TLS
- Standard SSL certificate validation
- No custom certificate pinning or custom encryption

### Data Storage
- Uses iOS Keychain for sensitive data
- Standard iOS data protection APIs
- No custom encryption for local storage

### Web Content
- WebView loads content over HTTPS
- Standard browser security protocols
- No custom encryption for web content

## Conclusion
Thenga uses only standard, exempt encryption methods provided by iOS and standard web technologies. No custom or proprietary encryption is implemented. The app is compliant with Apple's encryption export requirements.

---
**Date:** January 2025  
**App Version:** 1.0  
**Bundle ID:** com.thenga.commerce
