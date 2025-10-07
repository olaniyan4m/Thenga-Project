// 💰 Pezela Business Subscription Pricing Model (Simplified)
// Pricing configuration for merchant subscriptions

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
}

export interface AddOnService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isOptional: boolean;
}

export interface SetupFee {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  isOneTime: boolean;
  features: string[];
}

// Simple pricing configuration
const PRICING_CONFIG = {
  SETUP_FEE: 0, // FREE for new product launch
  MONTHLY_SUBSCRIPTION: 199, // R199/month (after free trial)
  BOOKKEEPING_ADDON: 249, // R249/month
  BACKUP_ADDON: 99, // R99/month
  CURRENCY: 'ZAR',
  FREE_TRIAL_DAYS: 30, // 30 days free trial
};

// Setup fee configuration
const setupFee: SetupFee = {
  id: 'setup_fee',
  name: 'Business Onboarding',
  description: 'FREE setup for new product launch',
  price: 0,
  currency: 'ZAR',
  isOneTime: true,
  features: [
    'WhatsApp Business API setup',
    'QR code payment integration',
    'Invoice template customization',
    'Business profile setup',
    'Payment gateway configuration',
    'Initial training session',
    'Account setup assistance',
    '30-day free trial (credit card required for auto-renewal)',
  ],
};

// Monthly subscription tiers
const subscriptionTiers: PricingTier[] = [
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    description: 'Essential features for small businesses - 30 DAYS FREE TRIAL',
    price: 199,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      '30-day free trial (credit card required)',
      'WhatsApp automation',
      'QR code payments',
      'Basic invoicing',
      'Order management',
      'Customer database',
      'Basic analytics',
      '1 support call per month',
      'Mobile app access',
      'PWA access',
    ],
    isRecommended: true,
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    description: 'Advanced features for growing businesses - 30 DAYS FREE TRIAL',
    price: 399,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      '30-day free trial (credit card required)',
      'All Basic features',
      'Advanced analytics',
      'Inventory management',
      'Staff management',
      'Multi-location support',
      'Priority support',
      '3 support calls per month',
      'Custom branding',
      'API access',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise_monthly',
    name: 'Enterprise Monthly',
    description: 'Full-featured solution for large businesses - 30 DAYS FREE TRIAL',
    price: 799,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      '30-day free trial (credit card required)',
      'All Premium features',
      'Advanced reporting',
      'Custom integrations',
      'Dedicated account manager',
      'Unlimited support',
      'White-label options',
      'Custom development',
      'SLA guarantees',
    ],
  },
];

// Add-on services
const addOnServices: AddOnService[] = [
  {
    id: 'bookkeeping_snapshot',
    name: 'Bookkeeping Snapshot',
    description: 'Automated bookkeeping and financial reporting',
    price: 249,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      'Automated transaction categorization',
      'Financial reports generation',
      'Tax preparation assistance',
      'SARS compliance reporting',
      'Expense tracking',
      'Profit & loss statements',
      'Balance sheet generation',
    ],
    isOptional: true,
  },
  {
    id: 'managed_backups',
    name: 'Managed Backups',
    description: 'Automated data backup and recovery',
    price: 99,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      'Daily automated backups',
      'Cloud storage',
      'Data recovery services',
      'Backup verification',
      'Disaster recovery planning',
      'Data retention management',
    ],
    isOptional: true,
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Business intelligence and insights',
    price: 149,
    currency: 'ZAR',
    billingCycle: 'monthly',
    features: [
      'Advanced reporting',
      'Business insights',
      'Trend analysis',
      'Customer behavior analytics',
      'Sales forecasting',
      'Performance metrics',
    ],
    isOptional: true,
  },
];

// Simple pricing service
export const PricingModelService = {
  getSetupFee: () => setupFee,
  getSubscriptionTiers: () => subscriptionTiers,
  getAddOnServices: () => addOnServices,
  getPricingSummary: () => ({
    setupFee: PRICING_CONFIG.SETUP_FEE,
    monthlySubscription: PRICING_CONFIG.MONTHLY_SUBSCRIPTION,
    bookkeepingAddOn: PRICING_CONFIG.BOOKKEEPING_ADDON,
    backupAddOn: PRICING_CONFIG.BACKUP_ADDON,
    analyticsAddOn: 149,
    currency: PRICING_CONFIG.CURRENCY,
  }),
  calculateRevenue: (clients: number, addOnBookkeeping: number = 0, addOnBackup: number = 0, addOnAnalytics: number = 0) => {
    const setupFeeRevenue = clients * PRICING_CONFIG.SETUP_FEE;
    const monthlySubscriptionRevenue = clients * PRICING_CONFIG.MONTHLY_SUBSCRIPTION;
    const addOnRevenue = 
      (addOnBookkeeping * PRICING_CONFIG.BOOKKEEPING_ADDON) +
      (addOnBackup * PRICING_CONFIG.BACKUP_ADDON) +
      (addOnAnalytics * 149);

    const totalRevenue = setupFeeRevenue + monthlySubscriptionRevenue + addOnRevenue;

    return {
      setupFeeRevenue,
      monthlySubscriptionRevenue,
      addOnRevenue,
      totalRevenue,
    };
  },
};

export default PricingModelService;
