# Thenga Business App - Live Production Deployment Guide

This guide explains how to deploy the Thenga Business App with live data integration between the customer storefront and business dashboard.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the `standalone-pwa` directory:

```bash
# API Configuration
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_API_KEY=your-production-api-key
REACT_APP_BUSINESS_ID=your-business-id

# WebSocket Configuration
REACT_APP_WEBSOCKET_URL=wss://your-api-domain.com/ws

# Customer Storefront
REACT_APP_STOREFRONT_URL=https://your-storefront-domain.com
REACT_APP_CUSTOMER_DOMAIN=your-storefront-domain.com

# WhatsApp Integration
REACT_APP_WHATSAPP_API_URL=https://your-api-domain.com/whatsapp
REACT_APP_WHATSAPP_API_KEY=your-whatsapp-api-key

# Feature Flags
REACT_APP_ENABLE_LIVE_ORDERS=true
REACT_APP_ENABLE_WEBSOCKET=true
REACT_APP_ENABLE_WHATSAPP=true
```

### 2. Build for Production

```bash
cd standalone-pwa
npm run build
```

### 3. Deploy to Your Hosting Platform

The built files will be in the `dist` directory. Deploy these to your hosting platform (Vercel, Netlify, AWS S3, etc.).

## 🔧 Backend API Requirements

Your backend API needs to support the following endpoints:

### Orders API
- `GET /api/orders` - Fetch all orders for business
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders` - Create new order (from customer storefront)

### WebSocket Events
- `new_order` - New order created by customer
- `order_update` - Order details updated
- `order_status_change` - Order status changed

### WhatsApp API
- `POST /api/whatsapp/send` - Send WhatsApp message

## 📱 Customer Storefront Integration

### 1. Order Creation Flow

When a customer places an order on the storefront:

```javascript
// In CustomerStorefront.tsx
const handleCheckout = async () => {
  const orderData = {
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    customerEmail: customerInfo.email,
    items: cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      totalPrice: item.totalPrice
    })),
    subtotal: getSubtotal(),
    deliveryFee: 25,
    tax: getTax(),
    totalAmount: getGrandTotal(),
    status: 'pending',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    businessId: 'store_123'
  };

  // Send to API
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(orderData)
  });

  if (response.ok) {
    // Order created successfully
    // WebSocket will notify business dashboard
  }
};
```

### 2. Real-time Updates

The business dashboard receives real-time updates via WebSocket:

```javascript
// In ApiService.ts
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'new_order':
      // Add new order to business dashboard
      this.notifyListeners({ type: 'new_order', data: data.order });
      break;
    case 'order_update':
      // Update existing order
      this.notifyListeners({ type: 'order_update', data: data.order });
      break;
  }
};
```

## 🔄 Data Flow Architecture

```
Customer Storefront → API → WebSocket → Business Dashboard
     ↓                ↓         ↓            ↓
   Places Order → Creates Order → Real-time → Updates UI
     ↓                ↓         ↓            ↓
   Payment → Order Status → Notification → Order Management
```

## 📊 Production Features

### Live Order Management
- ✅ Real-time order updates
- ✅ Status change notifications
- ✅ Customer communication via WhatsApp
- ✅ Order statistics and analytics

### Customer Experience
- ✅ Seamless ordering process
- ✅ Real-time order tracking
- ✅ WhatsApp notifications
- ✅ Payment processing

## 🛠️ Development vs Production

### Development Mode
- Uses local storage for data persistence
- Mock API responses
- Demo WhatsApp notifications
- Local WebSocket server

### Production Mode
- Real API integration
- Live WebSocket connections
- Actual WhatsApp Business API
- Real payment processing

## 🔐 Security Considerations

1. **API Keys**: Store securely in environment variables
2. **CORS**: Configure proper CORS settings for your domains
3. **Authentication**: Implement proper JWT token authentication
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Data Validation**: Validate all incoming data

## 📈 Monitoring and Analytics

### Health Checks
- API endpoint health monitoring
- WebSocket connection status
- Order processing metrics

### Analytics
- Order volume tracking
- Customer behavior analysis
- Business performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check WebSocket URL configuration
   - Verify network connectivity
   - Check firewall settings

2. **Orders Not Updating**
   - Verify API endpoint configuration
   - Check authentication tokens
   - Review browser console for errors

3. **WhatsApp Not Working**
   - Verify WhatsApp API configuration
   - Check API key validity
   - Review message formatting

### Debug Mode

Enable debug logging by setting:
```bash
REACT_APP_DEBUG=true
```

## 📞 Support

For technical support or questions about deployment:
- Check the console logs for error messages
- Verify all environment variables are set correctly
- Test API endpoints independently
- Review WebSocket connection status

## 🔄 Updates and Maintenance

### Regular Updates
- Monitor API performance
- Update dependencies regularly
- Review security configurations
- Backup data regularly

### Scaling Considerations
- Database optimization for high order volumes
- WebSocket connection pooling
- CDN for static assets
- Load balancing for API servers
