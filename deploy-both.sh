#!/bin/bash

# 🚀 Deploy Both Applications to Firebase Hosting
# This script builds and deploys both Business and Customer Apps to Firebase

echo "🚀 Deploying Both Thenga Applications to Firebase..."

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

# Deploy Business Application
print_info "Deploying Business Application..."
cd standalone-pwa

# Install dependencies
print_info "Installing Business App dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install Business App dependencies"
    exit 1
fi

# Build Business App
print_info "Building Business Application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build Business Application"
    exit 1
fi

# Deploy Business App
print_info "Deploying Business App to Firebase..."
firebase deploy

if [ $? -ne 0 ]; then
    print_error "Failed to deploy Business App"
    exit 1
fi

print_status "Business Application deployed successfully!"

# Deploy Customer Application
print_info "Deploying Customer Application..."
cd ../apps/pwa

# Install dependencies
print_info "Installing Customer App dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install Customer App dependencies"
    exit 1
fi

# Build Customer App
print_info "Building Customer Application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build Customer Application"
    exit 1
fi

# Deploy Customer App
print_info "Deploying Customer App to Firebase..."
firebase deploy

if [ $? -ne 0 ]; then
    print_error "Failed to deploy Customer App"
    exit 1
fi

print_status "Customer Application deployed successfully!"

echo ""
echo "🎉 Both Thenga Applications are now live!"
echo ""
echo "📱 Business Application (Admin Dashboard):"
echo "   https://Thenga-business.web.app"
echo "   https://business.Thenga.web.app"
echo ""
echo "🛒 Customer Application (Storefront):"
echo "   https://Thenga-store.web.app"
echo "   https://store.Thenga.web.app"
echo ""
echo "🔐 Demo Credentials:"
echo "   Business Admin: demo@Thenga.co.za / DemoBusiness2024!"
echo "   Customer: customer@test.com / TestCustomer2024!"
echo ""
echo "📊 Key Features:"
echo "   ✅ Real-time order processing"
echo "   ✅ Payment gateway integration"
echo "   ✅ Inventory management"
echo "   ✅ Customer communication"
echo "   ✅ Financial reporting"
echo "   ✅ SARS compliance"
echo "   ✅ Advanced integrations"
echo ""
echo "🚀 Ready for investor presentations!"
echo ""
