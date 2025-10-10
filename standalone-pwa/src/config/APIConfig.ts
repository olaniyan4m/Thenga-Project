// 🔐 API Configuration for Real Integrations
// Production-ready configuration for SARS and accounting system integrations

export const API_CONFIG = {
  // SARS eFiling Configuration
  SARS: {
    clientId: import.meta.env.VITE_SARS_CLIENT_ID || 'your_sars_client_id',
    clientSecret: import.meta.env.VITE_SARS_CLIENT_SECRET || 'your_sars_client_secret',
    redirectUri: import.meta.env.VITE_SARS_REDIRECT_URI || 'https://Thenga.co.za/oauth/sars/callback',
    environment: (import.meta.env.VITE_SARS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    vatNumber: import.meta.env.VITE_VAT_NUMBER || '4880303328',
    taxYear: import.meta.env.VITE_TAX_YEAR || '2024'
  },

  // QuickBooks Configuration
  QUICKBOOKS: {
    clientId: import.meta.env.VITE_QUICKBOOKS_CLIENT_ID || 'your_quickbooks_client_id',
    clientSecret: import.meta.env.VITE_QUICKBOOKS_CLIENT_SECRET || 'your_quickbooks_client_secret',
    redirectUri: import.meta.env.VITE_QUICKBOOKS_REDIRECT_URI || 'https://Thenga.co.za/oauth/quickbooks/callback',
    environment: (import.meta.env.VITE_QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    companyId: import.meta.env.VITE_QUICKBOOKS_COMPANY_ID || 'your_company_id'
  },

  // Xero Configuration
  XERO: {
    clientId: import.meta.env.VITE_XERO_CLIENT_ID || 'your_xero_client_id',
    clientSecret: import.meta.env.VITE_XERO_CLIENT_SECRET || 'your_xero_client_secret',
    redirectUri: import.meta.env.VITE_XERO_REDIRECT_URI || 'https://Thenga.co.za/oauth/xero/callback',
    environment: (import.meta.env.VITE_XERO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  },

  // Sage Configuration
  SAGE: {
    clientId: import.meta.env.VITE_SAGE_CLIENT_ID || 'your_sage_client_id',
    clientSecret: import.meta.env.VITE_SAGE_CLIENT_SECRET || 'your_sage_client_secret',
    redirectUri: import.meta.env.VITE_SAGE_REDIRECT_URI || 'https://Thenga.co.za/oauth/sage/callback',
    environment: (import.meta.env.VITE_SAGE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  },

  // Pastel Configuration
  PASTEL: {
    clientId: import.meta.env.VITE_PASTEL_CLIENT_ID || 'your_pastel_client_id',
    clientSecret: import.meta.env.VITE_PASTEL_CLIENT_SECRET || 'your_pastel_client_secret',
    redirectUri: import.meta.env.VITE_PASTEL_REDIRECT_URI || 'https://Thenga.co.za/oauth/pastel/callback',
    environment: (import.meta.env.VITE_PASTEL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  },

  // Hardware Integration Configuration
  HARDWARE: {
    yoco: {
      apiKey: import.meta.env.VITE_YOCO_API_KEY || 'your_yoco_api_key',
      environment: (import.meta.env.VITE_YOCO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    snapscan: {
      apiKey: import.meta.env.VITE_SNAPSCAN_API_KEY || 'your_snapscan_api_key',
      environment: (import.meta.env.VITE_SNAPSCAN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    zapper: {
      apiKey: import.meta.env.VITE_ZAPPER_API_KEY || 'your_zapper_api_key',
      environment: (import.meta.env.VITE_ZAPPER_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    }
  },

  // Micro-lending Configuration
  LENDING: {
    experian: {
      apiKey: import.meta.env.VITE_EXPERIAN_API_KEY || 'your_experian_api_key',
      environment: (import.meta.env.VITE_EXPERIAN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    transunion: {
      apiKey: import.meta.env.VITE_TRANSUNION_API_KEY || 'your_transunion_api_key',
      environment: (import.meta.env.VITE_TRANSUNION_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    compuscan: {
      apiKey: import.meta.env.VITE_COMPUSCAN_API_KEY || 'your_compuscan_api_key',
      environment: (import.meta.env.VITE_COMPUSCAN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    }
  },

  // Marketplace Configuration
  MARKETPLACE: {
    uber_eats: {
      apiKey: import.meta.env.VITE_UBER_EATS_API_KEY || 'your_uber_eats_api_key',
      environment: (import.meta.env.VITE_UBER_EATS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    mr_d_food: {
      apiKey: import.meta.env.VITE_MR_D_FOOD_API_KEY || 'your_mr_d_food_api_key',
      environment: (import.meta.env.VITE_MR_D_FOOD_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    orderin: {
      apiKey: import.meta.env.VITE_ORDERIN_API_KEY || 'your_orderin_api_key',
      environment: (import.meta.env.VITE_ORDERIN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    }
  },

  // Loyalty & Coupons Configuration
  LOYALTY: {
    amplitude: {
      apiKey: import.meta.env.VITE_AMPLITUDE_API_KEY || 'your_amplitude_api_key',
      environment: (import.meta.env.VITE_AMPLITUDE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    mixpanel: {
      apiKey: import.meta.env.VITE_MIXPANEL_API_KEY || 'your_mixpanel_api_key',
      environment: (import.meta.env.VITE_MIXPANEL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    },
    airtime: {
      apiKey: import.meta.env.VITE_AIRTIME_API_KEY || 'your_airtime_api_key',
      environment: (import.meta.env.VITE_AIRTIME_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    }
  }
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:8000/api',
    sarsUrl: 'https://sandbox.efiling.sars.gov.za/api/v1',
    quickbooksUrl: 'https://sandbox-quickbooks.api.intuit.com/v3',
    xeroUrl: 'https://api.xero.com/api.xro/2.0',
    sageUrl: 'https://api.sage.com/v1',
    pastelUrl: 'https://api.pastel.com/v1'
  },
  production: {
    baseUrl: 'https://Thenga.co.za',
    apiUrl: 'https://api.Thenga.co.za',
    sarsUrl: 'https://efiling.sars.gov.za/api/v1',
    quickbooksUrl: 'https://quickbooks.api.intuit.com/v3',
    xeroUrl: 'https://api.xero.com/api.xro/2.0',
    sageUrl: 'https://api.sage.com/v1',
    pastelUrl: 'https://api.pastel.com/v1'
  }
};

// Security configuration
export const SECURITY_CONFIG = {
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || 'your_encryption_key',
  jwtSecret: import.meta.env.VITE_JWT_SECRET || 'your_jwt_secret',
  sessionTimeout: 3600000, // 1 hour in milliseconds
  maxRetries: 3,
  retryDelay: 1000 // 1 second
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  sars: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  },
  quickbooks: {
    requestsPerMinute: 100,
    requestsPerHour: 5000
  },
  xero: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  },
  sage: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  },
  pastel: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  }
};

export default API_CONFIG;
