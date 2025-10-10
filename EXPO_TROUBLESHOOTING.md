# 🔧 Expo Troubleshooting Guide

## 🚨 **Problem: "Terminal not allowing me to run from phone"**

### **Root Cause:**
- You're in the wrong directory
- Expo server not running properly
- Network connectivity issues

## ✅ **Step-by-Step Solution:**

### **Step 1: Navigate to Correct Directory**
```bash
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
pwd  # Should show: /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
```

### **Step 2: Kill Any Running Processes**
```bash
pkill -f "expo\|metro\|node.*start"
```

### **Step 3: Start Expo with Tunnel**
```bash
npx expo start --tunnel --clear
```

### **Step 4: Look for QR Code**
- Terminal should show a QR code
- Should show "Metro waiting on exp://..."
- Should show tunnel URL

## 📱 **What You Should See:**

### **✅ Correct Output:**
```
Metro waiting on exp://192.168.0.173:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a for Android emulator, or w to open on web browser.
› Press r to reload app, or m to toggle the menu.

› Press ? to show a list of available commands.
```

### **❌ Wrong Output:**
```
npm error Missing script: "start"
```

## 🔍 **Debugging Commands:**

### **Check if Expo is Running:**
```bash
lsof -i :8081
```

### **Check Network:**
```bash
ifconfig | grep inet
```

### **Check Expo Version:**
```bash
npx expo --version
```

## 🚀 **Alternative Methods:**

### **Method 1: Use Expo CLI Directly**
```bash
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
npx expo start
```

### **Method 2: Use npm start**
```bash
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
npm start
```

### **Method 3: Use Expo Go Web**
1. Go to https://expo.dev
2. Login with your account
3. Create new project
4. Upload your code

## 📱 **Testing on Phone:**

### **Step 1: Install Expo Go**
- Download from App Store
- Open Expo Go app

### **Step 2: Scan QR Code**
- Point camera at QR code
- Should open your app

### **Step 3: If QR Code Doesn't Work**
- Try typing the URL manually
- Check if both devices are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

## 💡 **Pro Tips:**

1. **Always use `--tunnel`** for mobile testing
2. **Make sure you're in the right directory**
3. **Check that Expo Go is installed**
4. **Try different network if needed**

## 🎯 **Quick Fix:**

```bash
# Navigate to correct directory
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore

# Kill any running processes
pkill -f "expo\|metro\|node.*start"

# Start Expo with tunnel
npx expo start --tunnel --clear

# Look for QR code in terminal
# Scan with Expo Go app on your phone
```

**The key is being in the right directory: `ThengaAppStore/` not `apps/pwa/`!** 🎯
