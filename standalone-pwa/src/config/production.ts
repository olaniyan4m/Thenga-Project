// Production Configuration for Live Deployment
// This file contains all the configuration needed for production deployment

export interface ProductionConfig {
  api: {
    baseUrl: string;
    apiKey: string;
    businessId: string;
  };
  websocket: {
    url: string;
    enabled: boolean;
  };
  storefront: {
    url: string;
    domain: string;
  };
  whatsapp: {
    apiUrl: string;
    apiKey: string;
    enabled: boolean;
  };
  payments: {
    payfast: {
      merchantId: string;
      merchantKey: string;
      passphrase: string;
    };
    enabled: boolean;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  analytics: {
    googleAnalyticsId: string;
    mixpanelToken: string;
  };
  features: {
    liveOrders: boolean;
    websocket: boolean;
    whatsapp: boolean;
    payments: boolean;
  };
}

// Production configuration
export const productionConfig: ProductionConfig = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://api.Thenga.com',
    apiKey: process.env.REACT_APP_API_KEY || '',
    businessId: process.env.REACT_APP_BUSINESS_ID || 'store_123'
  },
  websocket: {
    url: process.env.REACT_APP_WEBSOCKET_URL || 'wss://api.Thenga.com/ws',
    enabled: process.env.REACT_APP_ENABLE_WEBSOCKET === 'true'
  },
  storefront: {
    url: process.env.REACT_APP_STOREFRONT_URL || 'https://store.Thenga.com',
    domain: process.env.REACT_APP_CUSTOMER_DOMAIN || 'store.Thenga.com'
  },
  whatsapp: {
    apiUrl: process.env.REACT_APP_WHATSAPP_API_URL || 'https://api.Thenga.com/whatsapp',
    apiKey: process.env.REACT_APP_WHATSAPP_API_KEY || '',
    enabled: process.env.REACT_APP_ENABLE_WHATSAPP === 'true'
  },
  payments: {
    payfast: {
      merchantId: process.env.REACT_APP_PAYFAST_MERCHANT_ID || '',
      merchantKey: process.env.REACT_APP_PAYFAST_MERCHANT_KEY || '',
      passphrase: process.env.REACT_APP_PAYFAST_PASSPHRASE || ''
    },
    enabled: process.env.REACT_APP_ENABLE_PAYMENTS === 'true'
  },
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
  },
  analytics: {
    googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID || '',
    mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN || ''
  },
  features: {
    liveOrders: process.env.REACT_APP_ENABLE_LIVE_ORDERS === 'true',
    websocket: process.env.REACT_APP_ENABLE_WEBSOCKET === 'true',
    whatsapp: process.env.REACT_APP_ENABLE_WHATSAPP === 'true',
    payments: process.env.REACT_APP_ENABLE_PAYMENTS === 'true'
  }
};

// Development configuration
export const developmentConfig: ProductionConfig = {
  api: {
    baseUrl: 'http://localhost:3001',
    apiKey: 'dev-api-key-123',
    businessId: 'store_123'
  },
  websocket: {
    url: 'ws://localhost:3001/ws',
    enabled: true
  },
  storefront: {
    url: 'http://localhost:3000/#customer',
    domain: 'localhost:3000'
  },
  whatsapp: {
    apiUrl: 'http://localhost:3001/whatsapp',
    apiKey: 'dev-whatsapp-key',
    enabled: true
  },
  payments: {
    payfast: {
      merchantId: 'dev-merchant-id',
      merchantKey: 'dev-merchant-key',
      passphrase: 'dev-passphrase'
    },
    enabled: true
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },
  analytics: {
    googleAnalyticsId: '',
    mixpanelToken: ''
  },
  features: {
    liveOrders: true,
    websocket: true,
    whatsapp: true,
    payments: true
  }
};

// Get current configuration
export const getConfig = (): ProductionConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? developmentConfig : productionConfig;
};

export default getConfig;