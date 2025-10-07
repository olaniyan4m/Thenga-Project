# 🔥 Firebase Setup Steps - Get Your Web.app URLs

## 🚀 **Step-by-Step Setup Guide**

### **Step 1: Login to Firebase**
Open your terminal and run:
```bash
firebase login
```
This will open your browser to authenticate with Google.

### **Step 2: Create Firebase Projects**

#### **Option A: Using Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Create two projects:
   - **Project 1**: `pezela-business` (for Business App)
   - **Project 2**: `pezela-store` (for Customer App)

#### **Option B: Using Firebase CLI**
```bash
# Create Business App project
firebase projects:create pezela-business

# Create Customer App project  
firebase projects:create pezela-store
```

### **Step 3: Initialize Firebase Hosting**

#### **For Business App:**
```bash
cd standalone-pwa
firebase init hosting
```
- Select project: `pezela-business`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub integration: `No`

#### **For Customer App:**
```bash
cd apps/pwa
firebase init hosting
```
- Select project: `pezela-store`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub integration: `No`

### **Step 4: Build and Deploy**

#### **Deploy Business App:**
```bash
cd standalone-pwa
npm install --legacy-peer-deps
npm run build
firebase deploy
```

#### **Deploy Customer App:**
```bash
cd apps/pwa
npm install --legacy-peer-deps
npm run build
firebase deploy
```

---

## 🌐 **Your Web.app URLs Will Be:**

### **Business Application:**
- `https://pezela-business.web.app`
- `https://pezela-business.firebaseapp.com`

### **Customer Application:**
- `https://pezela-store.web.app`
- `https://pezela-store.firebaseapp.com`

---

## 🔧 **Quick Setup Script**

I'll create a script to automate this process:

```bash
# Make sure you're logged in first
firebase login

# Then run the setup script
./setup-firebase-projects.sh
```

---

## 🎯 **Alternative: Use Existing Projects**

If you already have Firebase projects, you can use them:

1. **Update .firebaserc files:**
   - Change `pezela-business` to your existing project ID
   - Change `pezela-store` to your existing project ID

2. **Deploy directly:**
   ```bash
   ./deploy-both.sh
   ```

---

## 🚨 **Troubleshooting**

### **"Site Not Found" Error:**
This means the Firebase project doesn't exist or hasn't been deployed yet.

**Solution:**
1. Create the Firebase projects first
2. Initialize hosting
3. Build and deploy

### **"Project not found" Error:**
The project ID in `.firebaserc` doesn't match your Firebase projects.

**Solution:**
1. Check your Firebase console for correct project IDs
2. Update `.firebaserc` files with correct project IDs

### **Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## 📱 **After Deployment**

Your apps will be live at:
- **Business**: `https://pezela-business.web.app`
- **Customer**: `https://pezela-store.web.app`

Both will be fully functional with all features!

---

## 🎉 **Ready for Investor Demo!**

Once deployed, you'll have professional web.app URLs perfect for investor presentations!
