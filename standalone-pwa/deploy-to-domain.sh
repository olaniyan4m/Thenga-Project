#!/bin/bash

# Deploy Pezela Business App to https://pezela.mozdev.co.za
# This script builds and prepares the app for deployment to your domain

echo "🚀 Deploying Pezela Business App to https://pezela.mozdev.co.za"

# Navigate to the app directory
cd /Users/macbook/Documents/MoWebProjects/Pezela_Project/Pezela/standalone-pwa

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build for production
echo "🔨 Building for production..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp package.json deployment/
cp package-lock.json deployment/

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Pezela Business App - Domain Deployment

## Domain: https://pezela.mozdev.co.za

### Files to Upload:
1. Upload all files from the `deployment/` folder to your domain's root directory
2. Ensure `index.html` is in the root directory
3. Upload all assets from the `assets/` folder

### Server Configuration:
- Ensure your server supports SPA (Single Page Application) routing
- Configure redirects for all routes to `index.html`
- Enable HTTPS (SSL certificate)

### Domain Setup:
1. Point your domain to your hosting provider
2. Configure DNS settings
3. Set up SSL certificate for HTTPS

### Testing:
- Visit https://pezela.mozdev.co.za
- Test all business features
- Verify mobile responsiveness

## Production Features:
✅ Business Dashboard with Calculator
✅ Orders Management
✅ Payments Tracking  
✅ Products Inventory
✅ Settings with Advanced Features
✅ Tax & SARS Compliance
✅ Hardware Integrations
✅ Merchant Micro-lending
✅ Marketplace
✅ Loyalty & Coupons
✅ Bookkeeping & Accounting

## Support:
For technical support, contact the development team.
EOF

echo "✅ Deployment package created in 'deployment/' folder"
echo "📋 See DEPLOYMENT_INSTRUCTIONS.md for next steps"
echo "🌐 Your app will be available at: https://pezela.mozdev.co.za"
