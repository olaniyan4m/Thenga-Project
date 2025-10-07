#!/bin/bash

# 🛒 Deploy Customer Application to Firebase Hosting
# This script builds and deploys the Customer App to Firebase

echo "🛒 Deploying Pezela Customer Application to Firebase..."

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

# Navigate to customer app directory
cd apps/pwa

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
print_info "Building Customer Application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build the application"
    exit 1
fi

# Deploy to Firebase
print_info "Deploying to Firebase Hosting..."
firebase deploy

if [ $? -eq 0 ]; then
    print_status "Customer Application deployed successfully!"
    echo ""
    echo "🌐 Your Customer App is now live at:"
    echo "   https://pezela-store.web.app"
    echo "   https://store.pezela.web.app"
    echo ""
    echo "🛒 Features available:"
    echo "   ✅ Product Catalog"
    echo "   ✅ Shopping Cart"
    echo "   ✅ User Authentication"
    echo "   ✅ Order Tracking"
    echo "   ✅ Payment Integration"
    echo "   ✅ Mobile Responsive"
    echo ""
    echo "🔐 Demo Credentials:"
    echo "   Email: customer@test.com"
    echo "   Password: TestCustomer2024!"
    echo ""
else
    print_error "Failed to deploy to Firebase"
    exit 1
fi
