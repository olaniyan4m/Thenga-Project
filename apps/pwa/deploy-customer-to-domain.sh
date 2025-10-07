#!/bin/bash

# Deploy Thenga Customer App to https://customerthenga.mozdev.co.za
# This script prepares the customer app for deployment to your domain

echo "🛒 Deploying Thenga Customer App to https://customerthenga.mozdev.co.za"

# Navigate to the customer app directory
cd /Users/macbook/Documents/MoWebProjects/Thenga_Project/Thenga/apps/pwa

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p customer-deployment
cp -r dist-backup/* customer-deployment/

# Create deployment instructions
cat > customer-deployment/CUSTOMER_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Thenga Customer App - Domain Deployment

## 🌐 Domain: https://customerthenga.mozdev.co.za

### 📁 Files to Upload:
1. Upload all files from the `customer-deployment/` folder to your domain's root directory
2. Ensure `index.html` is in the root directory
3. Upload all assets from the `assets/` folder

### ⚙️ Server Configuration:
- Ensure your server supports SPA (Single Page Application) routing
- Configure redirects for all routes to `index.html`
- Enable HTTPS (SSL certificate)

### 🔧 Domain Setup:
1. Point your domain to your hosting provider
2. Configure DNS settings
3. Set up SSL certificate for HTTPS

### 🧪 Testing:
- Visit https://customerthenga.mozdev.co.za
- Test all customer features
- Verify mobile responsiveness

## 🛒 Customer App Features:
✅ **Customer Dashboard** - Order tracking and account management
✅ **Product Catalog** - Browse and search products
✅ **Shopping Cart** - Add items and manage cart
✅ **Order Management** - Track orders and status
✅ **Payment Processing** - Secure payment options
✅ **Profile Settings** - Account management
✅ **Order History** - View past orders
✅ **Notifications** - Real-time updates

## 📱 PWA Features:
✅ **Installable** - Add to Home Screen on any device
✅ **Offline Support** - Works without internet
✅ **Push Notifications** - Real-time updates
✅ **Native Feel** - Full screen experience
✅ **Cross-Platform** - iPhone, Android, Desktop, Tablet

## 🚀 Deployment Steps:
1. Access your domain's file manager or FTP
2. Navigate to your domain's root directory
3. Upload all files from `customer-deployment/` folder
4. Ensure `index.html` is in the root directory
5. Upload all assets from `assets/` folder
6. Configure server for SPA routing
7. Enable HTTPS/SSL certificate

## 📞 Support:
For technical support, contact the development team.

---
**Deployment Date**: $(date)
**Version**: 1.0.0
**Build**: Production Ready
EOF

echo "✅ Customer deployment package created in 'customer-deployment/' folder"
echo "📋 See CUSTOMER_DEPLOYMENT_INSTRUCTIONS.md for next steps"
echo "🛒 Your customer app will be available at: https://customerthenga.mozdev.co.za"
