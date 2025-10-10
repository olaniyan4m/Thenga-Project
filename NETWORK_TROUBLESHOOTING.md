# 🔧 Network Troubleshooting Guide

## 🚨 **Problem: "Network connection was lost"**

### **Root Cause:**
- Your iPhone can't connect to the development server
- Network IP `192.168.0.173:8081` is not accessible
- Firewall or network restrictions

## ✅ **Solutions:**

### **Solution 1: Use Tunnel Mode (Recommended)**
```bash
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
npm start --tunnel
```
- This creates a secure tunnel through Expo's servers
- Works even with firewalls and network restrictions
- More reliable than local network

### **Solution 2: Check Network Connection**
1. **Make sure both devices are on same WiFi**
2. **Check firewall settings** on your Mac
3. **Try different network** (mobile hotspot)

### **Solution 3: Use Localhost with USB**
```bash
npm start --localhost
```
- Connect iPhone via USB cable
- Use Xcode to run on device
- More stable connection

### **Solution 4: Manual IP Configuration**
1. **Find your Mac's IP**: `ifconfig | grep inet`
2. **Update app.json** with correct IP
3. **Restart development server**

## 🎯 **Quick Fix Steps:**

### **Step 1: Stop Current Server**
- Press `Ctrl+C` in terminal
- Kill any running processes

### **Step 2: Start with Tunnel**
```bash
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/ThengaAppStore
npm start --tunnel
```

### **Step 3: Scan New QR Code**
- New QR code will appear
- Scan with Expo Go app
- Should work now!

## 🔍 **Debugging Commands:**

### **Check Network Status:**
```bash
# Check if port 8081 is open
lsof -i :8081

# Check network interfaces
ifconfig

# Test connectivity
ping 192.168.0.173
```

### **Reset Network:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart with tunnel
npm start --tunnel
```

## 📱 **Alternative Testing:**

### **Use Expo Go Web:**
1. Open `http://localhost:8081` in browser
2. Test app in browser first
3. Then try mobile connection

### **Use Expo Snack:**
1. Go to https://snack.expo.dev
2. Copy your code there
3. Test online without local server

## 🚀 **Best Practices:**

1. **Always use `--tunnel`** for mobile testing
2. **Keep devices on same network**
3. **Use USB connection** when possible
4. **Test in browser first** before mobile

## 💡 **Pro Tips:**

- **Tunnel mode** is most reliable
- **USB connection** is fastest
- **Browser testing** is easiest to debug
- **Expo Snack** is good for quick tests

**Try the tunnel mode first - it should solve your network issues!** 🎉
