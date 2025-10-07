# Pezela Firebase Development Package

This package replaces the original AWS blueprint and uses Firebase services instead:
- Firestore (database)
- Firebase Auth (authentication)
- Cloud Functions (backend API)
- Cloud Storage (images, assets)
- Hosting (PWA frontend)

Folders:
- openapi/ : OpenAPI spec (YAML)
- functions/ : Firebase Cloud Functions scaffold (TypeScript)
- react_pwa/ : React PWA skeleton with Firestore demo
- whatsapp_templates/ : WhatsApp templates JSON
- firebase_infra/ : firebase.json, firestore.rules, storage.rules
- .github/workflows/ : GitHub Actions workflow for deploy to Firebase

Quick start (high level):
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize your Firebase project and set project id in firebase.json or use `--project`
4. Deploy functions and hosting: `firebase deploy --only functions,hosting`
5. Set GitHub secret FIREBASE_TOKEN for CI deploy


## Local development quick steps
1. Install Firebase CLI and emulators: `npm install -g firebase-tools` and enable emulators
2. Start mock server: `cd mock_server && npm install && npm start`
3. Start functions emulator: `cd functions && npm install && npm run serve` (or use Docker)
4. Run PWA dev: `cd react_pwa && npm install && npm start`
5. Use Postman collection `postman_collection.json` to test endpoints.


## New additions (Payment PSP integrations, demo, marketing)
- PayFast & Yoco example endpoints and webhook handlers added to functions/index.ts
- Reconciliation admin endpoint: /admin/reconcile-payments
- Demo merchants JSON and onboarding walkthrough in demo_onboarding/
- WhatsApp flyer image at marketing/pezela_flyer.png
