# Pezela PWA - Digital Commerce Platform for South Africa

A comprehensive Progressive Web Application (PWA) for digital commerce, designed specifically for South African businesses. Features include merchant dashboard, customer storefront, payment processing, WhatsApp integration, and real-time order management.

## 🚀 Features

### Core Business Features
- **Dashboard**: Real-time business analytics and order management
- **Products**: Inventory management with stock tracking
- **Orders**: Order processing with status updates
- **Payments**: Payment tracking and reconciliation
- **Settings**: Business configuration and preferences

### Customer Features
- **Storefront**: Mobile-optimized shopping experience
- **Cart**: Shopping cart with quantity controls
- **Payment**: Secure payment processing with saved cards
- **WhatsApp**: Direct communication with business
- **Order Tracking**: Real-time order status updates

### Advanced Features
- **Tax Compliance**: SARS eFiling integration
- **Hardware Integration**: POS systems, card readers, barcode scanners
- **Micro-lending**: Credit scoring and loan management
- **Marketplace**: Delivery partner integrations
- **Loyalty Programs**: Customer rewards and coupons

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + NestJS + TypeScript
- **Database**: PostgreSQL + Redis
- **Authentication**: Firebase Auth
- **Payments**: PayFast integration
- **Messaging**: WhatsApp Business API
- **Deployment**: Docker + Kubernetes

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- PayFast merchant account
- WhatsApp Business API access

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd standalone-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   
   # PayFast Configuration
   VITE_PAYFAST_MERCHANT_ID=your_merchant_id
   VITE_PAYFAST_MERCHANT_KEY=your_merchant_key
   
   # WhatsApp Business API
   VITE_WHATSAPP_TOKEN=your_whatsapp_token
   VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   ```

4. **Start Development Server**
   ```bash
   # Business App (Port 3000)
   npm run dev
   
   # Customer Storefront (Port 3002)
   PORT=3002 npm run dev
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication
4. Add your domain to authorized domains
5. Copy configuration to `.env` file

### PayFast Setup
1. Register for PayFast merchant account
2. Get your merchant credentials
3. Configure webhook URLs
4. Add credentials to `.env` file

### WhatsApp Business API
1. Set up WhatsApp Business Account
2. Create Facebook App
3. Configure webhook for message handling
4. Add tokens to `.env` file

## 📱 Usage

### Business Dashboard
1. Navigate to `http://localhost:3000`
2. Login with demo credentials (no authentication required in demo)
3. Manage products, orders, and payments
4. Configure business settings

### Customer Storefront
1. Navigate to `http://localhost:3002`
2. Enter customer information
3. Browse products and add to cart
4. Complete payment process
5. Track order status

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # React components
├── services/           # Business logic services
├── config/             # Configuration files
├── assets/             # Static assets
└── App.tsx             # Main application
```

### Key Services
- **OrderService**: Order management and synchronization
- **WhatsAppService**: WhatsApp messaging
- **FirebaseService**: Data persistence
- **PaymentService**: Payment processing
- **PayFastService**: PayFast integration

## 🔒 Security

- **Data Encryption**: AES-256-GCM encryption
- **Authentication**: Firebase Auth with JWT
- **Payment Security**: PCI-DSS compliant
- **Data Protection**: POPIA compliance
- **Secure Communication**: HTTPS/TLS

## 📊 Monitoring

- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics + Amplitude
- **Performance**: Real-time monitoring
- **Logging**: Comprehensive audit logs

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t pezela-pwa .

# Run container
docker run -p 3000:3000 pezela-pwa
```

### Production Deployment
1. Configure production environment variables
2. Set up SSL certificates
3. Configure domain and DNS
4. Deploy to cloud platform (AWS/GCP/Azure)
5. Set up monitoring and logging

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for mobile
- **Offline Support**: Service worker caching
- **Bundle Size**: Optimized with code splitting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@pezela.co.za
- Documentation: [docs.pezela.co.za](https://docs.pezela.co.za)
- Issues: GitHub Issues

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core business features
- ✅ Customer storefront
- ✅ Payment integration
- ✅ WhatsApp messaging

### Phase 2 (Next)
- 🔄 Advanced analytics
- 🔄 Multi-language support
- 🔄 Advanced reporting
- 🔄 API integrations

### Phase 3 (Future)
- 📋 AI-powered insights
- 📋 Advanced automation
- 📋 Enterprise features
- 📋 Mobile app development

---

**Made with ❤️ in South Africa 🇿🇦**