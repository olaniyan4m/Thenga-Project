# 🚀 Thenga - Digital Commerce Platform for South Africa

**A fully functioning mobile-first digital commerce platform designed specifically for South African micro and small businesses.**

## ✨ Features

### 🏪 **For Merchants**
- **📱 Mobile-First Design**: Always displays in phone frame for mobile experience
- **⚡ Offline-First**: Works during loadshedding with local data storage
- **💳 Multiple Payment Options**: PayFast, Yoco, SnapScan, QR codes
- **📱 WhatsApp Commerce**: Send orders and payment links via WhatsApp
- **📊 Real-time Analytics**: Track sales, orders, and revenue
- **🛍️ Product Management**: Add, edit, and manage your product catalog
- **📋 Order Management**: Process orders from confirmation to completion

### 🇿🇦 **South African Focus**
- **ZAR Currency**: South African Rand support
- **Local Payment Gateways**: PayFast, Yoco, SnapScan integration
- **WhatsApp Business**: Familiar interface for customers
- **Loadshedding Resilient**: Offline-first design
- **Mobile-Optimized**: Perfect for Android phones

## 🏗️ **Architecture**

### **Frontend Applications**
- **📱 PWA**: Progressive Web App (always in phone frame)
- **📱 Mobile App**: React Native for iOS and Android
- **🖥️ Admin Dashboard**: Web-based admin interface

### **Backend Services**
- **🛡️ API Gateway**: NestJS with authentication and rate limiting
- **💳 Payments Service**: Multiple payment provider integrations
- **📱 Notifications Service**: WhatsApp, SMS, Email notifications
- **📊 Analytics Service**: Business intelligence and reporting

### **Infrastructure**
- **☁️ AWS EKS**: Kubernetes cluster in Cape Town (af-south-1)
- **🗄️ PostgreSQL**: Primary database with Prisma ORM
- **⚡ Redis**: Caching and message queues
- **📁 S3**: File and asset storage
- **🚀 CI/CD**: GitHub Actions automation

## 🚀 **Quick Start**

### **Option 1: Use the Startup Script**
```bash
./start-app.sh
```

### **Option 2: Manual Setup**

1. **Install Dependencies**
```bash
npm install
```

2. **Start PWA (Web App)**
```bash
cd apps/pwa
npm run dev
```

3. **Start Mobile App**
```bash
cd apps/mobile-app
npm run dev
```

4. **Start Backend API**
```bash
cd services/api-gateway
npm run dev
```

## 📱 **Running the App**

### **PWA (Web App)**
- **URL**: http://localhost:3000
- **Features**: Phone frame design, offline support, full functionality
- **Best for**: Testing and development

### **Mobile App**
- **iOS**: Open `apps/mobile-app/ios/Thenga.xcworkspace` in Xcode
- **Android**: Run `npx react-native run-android`
- **Features**: Native mobile experience, push notifications

### **Backend API**
- **URL**: http://localhost:3001
- **Documentation**: http://localhost:3001/api/docs
- **Features**: Authentication, payments, notifications

## 🎯 **App Features**

### **Authentication**
- ✅ User registration with business details
- ✅ Phone number verification
- ✅ JWT-based authentication
- ✅ Offline login support

### **Dashboard**
- ✅ Real-time stats (orders, revenue, pending)
- ✅ Quick actions (new order, add product, etc.)
- ✅ Recent orders with status updates
- ✅ Offline indicator and sync status

### **Product Management**
- ✅ Add/edit products with images
- ✅ Stock management
- ✅ Category organization
- ✅ Offline product creation

### **Order Management**
- ✅ Order creation and processing
- ✅ Status updates (pending → confirmed → ready → completed)
- ✅ Customer information
- ✅ WhatsApp notifications

### **Payment Processing**
- ✅ Multiple payment methods (card, QR, EFT, cash)
- ✅ South African payment gateways
- ✅ Payment status tracking
- ✅ Refund processing

### **WhatsApp Integration**
- ✅ Order confirmations
- ✅ Payment links
- ✅ Customer notifications
- ✅ Business messaging

## 🛠️ **Development**

### **Project Structure**
```
Thenga/
├── apps/
│   ├── pwa/                 # Progressive Web App
│   └── mobile-app/         # React Native Mobile App
├── services/
│   ├── api-gateway/         # NestJS API Gateway
│   ├── payments-service/    # Payment processing
│   └── notifications-service/ # WhatsApp, SMS, Email
├── libs/
│   ├── shared-types/        # TypeScript types
│   └── db-migrations/       # Database schema
└── infra/
    └── terraform/           # Infrastructure as Code
```

### **Tech Stack**
- **Frontend**: React, React Native, TypeScript
- **Backend**: NestJS, Node.js, TypeScript
- **Database**: PostgreSQL, Redis
- **Infrastructure**: AWS, Kubernetes, Terraform
- **Payments**: PayFast, Yoco, SnapScan
- **Notifications**: WhatsApp Business API

## 🧪 **Testing**

### **Run Tests**
```bash
# Test all applications
npm run test

# Test specific app
npm run test:pwa
npm run test:mobile
npm run test:api
```

### **Mock Data**
The app includes comprehensive mock data for testing:
- Sample products, orders, and payments
- Mock authentication
- Simulated API responses
- Offline data scenarios

## 🚀 **Deployment**

### **Development**
```bash
npm run dev
```

### **Production**
```bash
npm run build
npm run deploy
```

### **Infrastructure**
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## 📊 **Monitoring**

- **Logs**: Centralized logging with ELK stack
- **Metrics**: Prometheus + Grafana
- **Errors**: Sentry error tracking
- **Uptime**: Pingdom monitoring

## 🔒 **Security**

- **Authentication**: JWT tokens with refresh
- **Authorization**: Role-based access control
- **Data Protection**: POPIA compliant
- **Payment Security**: PCI DSS ready
- **Encryption**: TLS everywhere

## 🌟 **Key Benefits**

### **For South African Businesses**
- 🇿🇦 **Local Focus**: Built for South African market
- ⚡ **Loadshedding Ready**: Offline-first design
- 📱 **Mobile-First**: Perfect for Android phones
- 💰 **Local Payments**: PayFast, Yoco, SnapScan
- 💬 **WhatsApp Commerce**: Familiar interface

### **Technical Excellence**
- 🚀 **Performance**: Optimized for mobile networks
- 🔄 **Offline-First**: Works without internet
- 📱 **PWA**: Install as native app
- 🛡️ **Secure**: Enterprise-grade security
- 📈 **Scalable**: Kubernetes-ready

## 🎉 **Ready to Use!**

Your Thenga platform is now **fully functional** with:

✅ **Complete PWA** with phone frame design  
✅ **Mobile App** for iOS and Android  
✅ **Backend API** with all services  
✅ **Payment Integration** with local gateways  
✅ **WhatsApp Commerce** functionality  
✅ **Offline Support** for loadshedding  
✅ **Mock Data** for immediate testing  

## 🚀 **Next Steps**

1. **Test the App**: Run `./start-app.sh` and explore all features
2. **Customize**: Modify products, orders, and business settings
3. **Deploy**: Set up production infrastructure
4. **Launch**: Start serving real customers!

---

**Built with ❤️ for South African businesses**  
*Empowering micro and small businesses with digital commerce*