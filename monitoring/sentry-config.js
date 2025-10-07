// 🚀 Pezela Production Monitoring Configuration
// Sentry configuration for error tracking and performance monitoring

import * as Sentry from '@sentry/react-native';
import { Integrations } from '@sentry/tracing';

// Initialize Sentry for React Native
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  
  // Error Tracking
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message) {
        // Filter out network errors during loadshedding
        if (error.message.includes('Network request failed')) {
          return null; // Don't send network errors during loadshedding
        }
        
        // Filter out offline-related errors
        if (error.message.includes('offline') || error.message.includes('no internet')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Environment Configuration
  environment: process.env.NODE_ENV || 'production',
  release: process.env.APP_VERSION || '1.0.0',
  
  // User Context
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive information
    if (breadcrumb.category === 'http') {
      // Remove sensitive headers
      if (breadcrumb.data && breadcrumb.data.headers) {
        delete breadcrumb.data.headers.authorization;
        delete breadcrumb.data.headers.cookie;
      }
    }
    
    return breadcrumb;
  },
  
  // Integrations
  integrations: [
    new Integrations.Breadcrumbs({
      console: true,
      dom: true,
      fetch: true,
      history: true,
      sentry: true,
      xhr: true,
    }),
    new Integrations.GlobalHandlers({
      onerror: true,
      onunhandledrejection: true,
    }),
  ],
  
  // Tags for better filtering
  initialScope: {
    tags: {
      platform: 'mobile',
      app: 'pezela',
      country: 'ZA',
    },
  },
});

// Custom error boundaries for React components
export const ErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring helpers
export const performanceMonitoring = {
  // Track payment processing time
  trackPaymentProcessing: (paymentMethod, amount) => {
    const transaction = Sentry.startTransaction({
      name: 'Payment Processing',
      op: 'payment',
      tags: {
        payment_method: paymentMethod,
        amount: amount,
        currency: 'ZAR',
      },
    });
    
    return transaction;
  },
  
  // Track order creation time
  trackOrderCreation: (orderId, itemCount) => {
    const transaction = Sentry.startTransaction({
      name: 'Order Creation',
      op: 'order',
      tags: {
        order_id: orderId,
        item_count: itemCount,
      },
    });
    
    return transaction;
  },
  
  // Track WhatsApp message sending
  trackWhatsAppMessage: (messageType, recipient) => {
    const transaction = Sentry.startTransaction({
      name: 'WhatsApp Message',
      op: 'whatsapp',
      tags: {
        message_type: messageType,
        recipient: recipient,
      },
    });
    
    return transaction;
  },
  
  // Track offline sync operations
  trackOfflineSync: (operationType, recordCount) => {
    const transaction = Sentry.startTransaction({
      name: 'Offline Sync',
      op: 'sync',
      tags: {
        operation_type: operationType,
        record_count: recordCount,
      },
    });
    
    return transaction;
  },
};

// User context helpers
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    phone: user.phone,
    business_name: user.business_name,
    business_type: user.business_type,
  });
};

// Business context helpers
export const setBusinessContext = (business) => {
  Sentry.setContext('business', {
    id: business.id,
    name: business.name,
    type: business.type,
    location: business.location,
    registration_number: business.registration_number,
  });
};

// Payment context helpers
export const setPaymentContext = (payment) => {
  Sentry.setContext('payment', {
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    provider: payment.provider,
  });
};

// Custom metrics for business intelligence
export const trackBusinessMetrics = {
  // Track daily sales
  trackDailySales: (amount, orderCount) => {
    Sentry.addBreadcrumb({
      message: 'Daily sales tracked',
      category: 'business',
      level: 'info',
      data: {
        amount: amount,
        order_count: orderCount,
        date: new Date().toISOString().split('T')[0],
      },
    });
  },
  
  // Track customer acquisition
  trackCustomerAcquisition: (customerId, source) => {
    Sentry.addBreadcrumb({
      message: 'New customer acquired',
      category: 'business',
      level: 'info',
      data: {
        customer_id: customerId,
        source: source,
        timestamp: new Date().toISOString(),
      },
    });
  },
  
  // Track product performance
  trackProductPerformance: (productId, sales, revenue) => {
    Sentry.addBreadcrumb({
      message: 'Product performance tracked',
      category: 'business',
      level: 'info',
      data: {
        product_id: productId,
        sales: sales,
        revenue: revenue,
        timestamp: new Date().toISOString(),
      },
    });
  },
};

// Loadshedding detection and handling
export const loadsheddingHandler = {
  // Detect if we're in a loadshedding period
  isLoadshedding: () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Common loadshedding hours in South Africa
    const loadsheddingHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
    
    return loadsheddingHours.includes(hour);
  },
  
  // Handle loadshedding gracefully
  handleLoadshedding: () => {
    if (loadsheddingHandler.isLoadshedding()) {
      Sentry.addBreadcrumb({
        message: 'Loadshedding detected - switching to offline mode',
        category: 'system',
        level: 'warning',
        data: {
          timestamp: new Date().toISOString(),
          expected_duration: '2-4 hours',
        },
      });
      
      // Switch to offline mode
      return true;
    }
    
    return false;
  },
};

// Export Sentry for manual error reporting
export { Sentry };

// Default export for easy importing
export default Sentry;
