#!/bin/bash

# 🔥 Firebase Projects Setup Script
# This script helps you set up Firebase projects for Pezela Business Platform

echo "🔥 Setting up Firebase Projects for Pezela Business Platform..."

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

print_info "Firebase CLI is installed and you're logged in!"

# Create Firebase projects
print_info "Creating Firebase projects..."

# Create Business App project
print_info "Creating pezela-business project..."
firebase projects:create pezela-business --display-name "Pezela Business App"

if [ $? -eq 0 ]; then
    print_status "Business project created successfully!"
else
    print_warning "Business project might already exist or there was an issue."
fi

# Create Customer App project
print_info "Creating pezela-store project..."
firebase projects:create pezela-store --display-name "Pezela Customer Store"

if [ $? -eq 0 ]; then
    print_status "Customer project created successfully!"
else
    print_warning "Customer project might already exist or there was an issue."
fi

# Initialize Business App
print_info "Initializing Business App Firebase hosting..."
cd standalone-pwa

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    print_info "Initializing Firebase hosting for Business App..."
    firebase init hosting --project pezela-business
else
    print_info "Firebase already initialized for Business App"
fi

# Initialize Customer App
print_info "Initializing Customer App Firebase hosting..."
cd ../apps/pwa

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    print_info "Initializing Firebase hosting for Customer App..."
    firebase init hosting --project pezela-store
else
    print_info "Firebase already initialized for Customer App"
fi

print_status "Firebase projects setup complete!"
echo ""
echo "🎉 Your Firebase projects are ready!"
echo ""
echo "📱 Business App Project: pezela-business"
echo "🛒 Customer App Project: pezela-store"
echo ""
echo "🚀 Next steps:"
echo "1. Build and deploy your apps:"
echo "   ./deploy-both.sh"
echo ""
echo "2. Your web.app URLs will be:"
echo "   Business: https://pezela-business.web.app"
echo "   Customer: https://pezela-store.web.app"
echo ""
echo "🔐 Demo Credentials:"
echo "   Business: demo@pezela.co.za / DemoBusiness2024!"
echo "   Customer: customer@test.com / TestCustomer2024!"
echo ""
