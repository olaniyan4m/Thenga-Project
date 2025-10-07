#!/bin/bash

# 🚀 Deploy Business Application to Firebase Hosting
# This script builds and deploys the Business App to Firebase

echo "🚀 Deploying Pezela Business Application to Firebase..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Navigate to business app directory
cd standalone-pwa

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

# Install dependencies
print_info "Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the application
print_info "Building Business Application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build the application"
    exit 1
fi

# Deploy to Firebase
print_info "Deploying to Firebase Hosting..."
firebase deploy

if [ $? -eq 0 ]; then
    print_status "Business Application deployed successfully!"
    echo ""
    echo "🌐 Your Business App is now live at:"
    echo "   https://pezela-business.web.app"
    echo "   https://business.pezela.web.app"
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
    echo "🔐 Demo Credentials:"
    echo "   Email: demo@pezela.co.za"
    echo "   Password: DemoBusiness2024!"
    echo ""
else
    print_error "Failed to deploy to Firebase"
    exit 1
fi
