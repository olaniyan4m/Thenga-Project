#!/bin/bash

# Thenga App Startup Script
# This script starts the fully functioning Thenga app

echo "🚀 Starting Thenga - Digital Commerce Platform for South Africa"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Thenga project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install PWA dependencies
if [ ! -d "apps/pwa/node_modules" ]; then
    echo "📦 Installing PWA dependencies..."
    cd apps/pwa
    npm install
    cd ../..
fi

# Install Mobile App dependencies
if [ ! -d "apps/mobile-app/node_modules" ]; then
    echo "📦 Installing Mobile App dependencies..."
    cd apps/mobile-app
    npm install
    cd ../..
fi

# Install API Gateway dependencies
if [ ! -d "services/api-gateway/node_modules" ]; then
    echo "📦 Installing API Gateway dependencies..."
    cd services/api-gateway
    npm install
    cd ../..
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "🎯 Available Commands:"
echo "====================="
echo ""
echo "📱 PWA (Web App):"
echo "   npm run dev:pwa"
echo ""
echo "📱 Mobile App (React Native):"
echo "   npm run dev:mobile"
echo ""
echo "🛠️  API Gateway (Backend):"
echo "   npm run dev:api"
echo ""
echo "🏗️  Build All:"
echo "   npm run build"
echo ""
echo "🧪 Test All:"
echo "   npm run test"
echo ""
echo "🚀 Quick Start - PWA:"
echo "====================="
echo "Starting the PWA in development mode..."
echo ""

# Start the PWA
cd apps/pwa
npm run dev
