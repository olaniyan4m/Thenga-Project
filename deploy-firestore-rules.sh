#!/bin/bash

# Deploy Firestore rules to fix permissions
echo "Deploying Firestore rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
firebase login --no-localhost

# Deploy Firestore rules
firebase deploy --only firestore:rules

echo "Firestore rules deployed successfully!"
echo "This should fix the 'Missing or insufficient permissions' error."
