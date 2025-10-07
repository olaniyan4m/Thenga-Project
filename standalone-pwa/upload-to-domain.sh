#!/bin/bash

# Upload Pezela Business App to https://pezela.mozdev.co.za
# This script helps you upload your app files to your domain

echo "🚀 Uploading Pezela Business App to https://pezela.mozdev.co.za"

# Check if deployment folder exists
if [ ! -d "deployment" ]; then
    echo "❌ Deployment folder not found. Run ./deploy-to-domain.sh first."
    exit 1
fi

echo "📁 Files ready for upload:"
ls -la deployment/

echo ""
echo "📋 Upload Instructions:"
echo "1. Access your domain's file manager or FTP"
echo "2. Navigate to your domain's root directory (public_html or www)"
echo "3. Upload all files from the 'deployment/' folder"
echo "4. Ensure 'index.html' is in the root directory"
echo "5. Upload all assets from the 'assets/' folder"

echo ""
echo "🔧 Server Configuration Required:"
echo "- Enable SPA routing (redirect all routes to index.html)"
echo "- Enable HTTPS/SSL certificate"
echo "- Configure proper MIME types"

echo ""
echo "🌐 After upload, your app will be available at:"
echo "https://pezela.mozdev.co.za"

echo ""
echo "✅ Upload complete! Test your app at the domain above."
