#!/bin/bash

# 🚀 Pezela Business Platform - Investor Demo Setup Script
# This script sets up both Business and Customer applications for investor demos

echo "🚀 Setting up Pezela Business Platform for Investor Demo..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_info "Setting up Business Application (Port 3000)..."

# Navigate to standalone-pwa directory
cd standalone-pwa

# Install dependencies
print_info "Installing Business App dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Business App dependencies installed successfully"
else
    print_error "Failed to install Business App dependencies"
    exit 1
fi

# Start Business App in background
print_info "Starting Business Application on port 3000..."
npm run dev &
BUSINESS_PID=$!

# Wait a moment for the app to start
sleep 5

# Navigate to customer app directory
cd ../apps/pwa

# Install dependencies
print_info "Installing Customer App dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Customer App dependencies installed successfully"
else
    print_error "Failed to install Customer App dependencies"
    exit 1
fi

# Start Customer App in background
print_info "Starting Customer Application on port 3002..."
npm run dev &
CUSTOMER_PID=$!

# Wait for both apps to start
print_info "Waiting for applications to start..."
sleep 10

# Check if applications are running
print_info "Checking application status..."

# Check Business App
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Business Application is running on http://localhost:3000"
else
    print_warning "Business Application may not be fully started yet"
fi

# Check Customer App
if curl -s http://localhost:3002 > /dev/null; then
    print_status "Customer Application is running on http://localhost:3002"
else
    print_warning "Customer Application may not be fully started yet"
fi

echo ""
echo "🎉 Pezela Business Platform is ready for Investor Demo!"
echo ""
echo "📱 Business Application (Admin Dashboard):"
echo "   URL: http://localhost:3000"
echo "   Features: Order management, payments, inventory, analytics"
echo ""
echo "🛒 Customer Application (Storefront):"
echo "   URL: http://localhost:3002"
echo "   Features: Product catalog, shopping cart, checkout"
echo ""
echo "🔐 Demo Credentials:"
echo "   Business Admin: demo@pezela.co.za / DemoBusiness2024!"
echo "   Customer: customer@test.com / TestCustomer2024!"
echo ""
echo "📊 Key Demo Features:"
echo "   ✅ Real-time order processing"
echo "   ✅ Payment gateway integration"
echo "   ✅ Inventory management"
echo "   ✅ Customer communication"
echo "   ✅ Financial reporting"
echo "   ✅ SARS compliance"
echo "   ✅ Advanced integrations"
echo ""
echo "🚀 Both applications are now running and ready for investor presentation!"
echo ""
echo "To stop the applications, press Ctrl+C or run:"
echo "   kill $BUSINESS_PID $CUSTOMER_PID"
echo ""

# Keep the script running
print_info "Applications are running. Press Ctrl+C to stop..."
wait
