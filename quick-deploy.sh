#!/bin/bash

# 🚀 Quick Deploy Script for Pezela Business Platform
# This script handles Firebase deployment with retry logic

echo "🚀 Quick Deploy to Firebase..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to deploy with retry
deploy_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_info "Deployment attempt $attempt of $max_attempts..."
        
        if firebase deploy --only hosting; then
            print_status "Deployment successful!"
            return 0
        else
            print_warning "Deployment attempt $attempt failed. Retrying..."
            attempt=$((attempt + 1))
            sleep 5
        fi
    done
    
    print_error "All deployment attempts failed."
    return 1
}

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the project directory."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_info "Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Deploy with retry logic
deploy_with_retry

if [ $? -eq 0 ]; then
    print_status "🎉 Deployment completed successfully!"
    echo ""
    echo "🌐 Your Business App is now live at:"
    echo "   https://pezela.web.app"
    echo ""
    echo "🔐 Demo Credentials:"
    echo "   Email: demo@pezela.co.za"
    echo "   Password: DemoBusiness2024!"
    echo ""
    echo "📱 Features available:"
    echo "   ✅ Dashboard Analytics"
    echo "   ✅ Order Management"
    echo "   ✅ Payment Processing"
    echo "   ✅ Inventory Management"
    echo "   ✅ Customer Management"
    echo "   ✅ Financial Reports"
    echo "   ✅ Advanced Features"
    echo ""
    echo "🚀 Ready for investor presentations!"
else
    print_error "Deployment failed. Please try again or check your Firebase configuration."
    exit 1
fi
