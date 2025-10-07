// 💰 Pezela Business Subscription Pricing Model
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

export interface RevenueProjection {
  month: number;
  newClients: number;
  totalClients: number;
  monthlySubscriptionRevenue: number;
  setupFeeRevenue: number;
  addOnRevenue: number;
  totalRevenue: number;
  cumulativeRevenue: number;
}

export interface BusinessMetrics {
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  growthRate: number;
}

class PricingModelService {
  // Core pricing configuration
  private readonly PRICING_CONFIG = {
    SETUP_FEE: 0, // FREE for new product launch
    MONTHLY_SUBSCRIPTION: 199, // R199/month (after free trial)
    BOOKKEEPING_ADDON: 249, // R249/month
    BACKUP_ADDON: 99, // R99/month
    CURRENCY: 'ZAR',
    FREE_TRIAL_DAYS: 30, // 30 days free trial
  };

  // Setup fee configuration
  private readonly setupFee: SetupFee = {
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
  private readonly subscriptionTiers: PricingTier[] = [
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
  private readonly addOnServices: AddOnService[] = [
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

  // Revenue projections
  private readonly revenueProjections: RevenueProjection[] = [
    {
      month: 1,
      newClients: 50,
      totalClients: 50,
      monthlySubscriptionRevenue: 9950, // 50 × R199
      setupFeeRevenue: 14950, // 50 × R299
      addOnRevenue: 0,
      totalRevenue: 24900, // R9,950 + R14,950
      cumulativeRevenue: 24900,
    },
    {
      month: 2,
      newClients: 30,
      totalClients: 80,
      monthlySubscriptionRevenue: 15920, // 80 × R199
      setupFeeRevenue: 8970, // 30 × R299
      addOnRevenue: 4980, // 20 × R249 (bookkeeping)
      totalRevenue: 29870, // R15,920 + R8,970 + R4,980
      cumulativeRevenue: 54770,
    },
    {
      month: 3,
      newClients: 40,
      totalClients: 120,
      monthlySubscriptionRevenue: 23880, // 120 × R199
      setupFeeRevenue: 11960, // 40 × R299
      addOnRevenue: 9960, // 40 × R249 (bookkeeping)
      totalRevenue: 45800, // R23,880 + R11,960 + R9,960
      cumulativeRevenue: 100570,
    },
    {
      month: 6,
      newClients: 60,
      totalClients: 200,
      monthlySubscriptionRevenue: 39800, // 200 × R199
      setupFeeRevenue: 17940, // 60 × R299
      addOnRevenue: 19920, // 80 × R249 (bookkeeping)
      totalRevenue: 77660, // R39,800 + R17,940 + R19,920
      cumulativeRevenue: 300000,
    },
    {
      month: 12,
      newClients: 100,
      totalClients: 400,
      monthlySubscriptionRevenue: 79600, // 400 × R199
      setupFeeRevenue: 29900, // 100 × R299
      addOnRevenue: 39840, // 160 × R249 (bookkeeping)
      totalRevenue: 149340, // R79,600 + R29,900 + R39,840
      cumulativeRevenue: 1000000,
    },
  ];

  // Get setup fee
  getSetupFee(): SetupFee {
    return this.setupFee;
  }

  // Get subscription tiers
  getSubscriptionTiers(): PricingTier[] {
    return this.subscriptionTiers;
  }

  // Get add-on services
  getAddOnServices(): AddOnService[] {
    return this.addOnServices;
  }

  // Get revenue projections
  getRevenueProjections(): RevenueProjection[] {
    return this.revenueProjections;
  }

  // Calculate revenue for specific scenario
  calculateRevenue(
    clients: number,
    addOnBookkeeping: number = 0,
    addOnBackup: number = 0,
    addOnAnalytics: number = 0
  ): {
    setupFeeRevenue: number;
    monthlySubscriptionRevenue: number;
    addOnRevenue: number;
    totalRevenue: number;
  } {
    const setupFeeRevenue = clients * this.PRICING_CONFIG.SETUP_FEE;
    const monthlySubscriptionRevenue = clients * this.PRICING_CONFIG.MONTHLY_SUBSCRIPTION;
    const addOnRevenue = 
      (addOnBookkeeping * this.PRICING_CONFIG.BOOKKEEPING_ADDON) +
      (addOnBackup * this.PRICING_CONFIG.BACKUP_ADDON) +
      (addOnAnalytics * 149); // Analytics add-on price

    const totalRevenue = setupFeeRevenue + monthlySubscriptionRevenue + addOnRevenue;

    return {
      setupFeeRevenue,
      monthlySubscriptionRevenue,
      addOnRevenue,
      totalRevenue,
    };
  }

  // Calculate business metrics
  calculateBusinessMetrics(): BusinessMetrics {
    const totalClients = this.revenueProjections[this.revenueProjections.length - 1].totalClients;
    const monthlyRevenue = this.revenueProjections[this.revenueProjections.length - 1].monthlySubscriptionRevenue;
    const totalRevenue = this.revenueProjections[this.revenueProjections.length - 1].cumulativeRevenue;

    return {
      averageRevenuePerUser: monthlyRevenue / totalClients,
      customerLifetimeValue: totalRevenue / totalClients,
      monthlyRecurringRevenue: monthlyRevenue,
      churnRate: 0.05, // 5% monthly churn rate
      growthRate: 0.20, // 20% monthly growth rate
    };
  }

  // Get pricing summary
  getPricingSummary(): {
    setupFee: number;
    monthlySubscription: number;
    bookkeepingAddOn: number;
    backupAddOn: number;
    analyticsAddOn: number;
    currency: string;
  } {
    return {
      setupFee: this.PRICING_CONFIG.SETUP_FEE,
      monthlySubscription: this.PRICING_CONFIG.MONTHLY_SUBSCRIPTION,
      bookkeepingAddOn: this.PRICING_CONFIG.BOOKKEEPING_ADDON,
      backupAddOn: this.PRICING_CONFIG.BACKUP_ADDON,
      analyticsAddOn: 149,
      currency: this.PRICING_CONFIG.CURRENCY,
    };
  }

  // Get revenue scenario example
  getRevenueScenarioExample(): {
    scenario: string;
    clients: number;
    setupFeeRevenue: number;
    monthlySubscriptionRevenue: number;
    addOnRevenue: number;
    totalRevenue: number;
    description: string;
  } {
    const clients = 50;
    const bookkeepingClients = 20;
    const calculation = this.calculateRevenue(clients, bookkeepingClients, 0, 0);

    return {
      scenario: 'Month 1 - 50 New Clients',
      clients,
      setupFeeRevenue: calculation.setupFeeRevenue,
      monthlySubscriptionRevenue: calculation.monthlySubscriptionRevenue,
      addOnRevenue: calculation.addOnRevenue,
      totalRevenue: calculation.totalRevenue,
      description: `50 clients in month 1 (realistic for local walk-in sales & social media marketing). Monthly subscription revenue = 50 × R199 = R9,950. One-time setup revenue = 50 × R299 = R14,950. Total first-month income = R9,950 + R14,950 = R24,900. If you add bookkeeping for 20 of those clients at R249/month: extra 20×249 = R4,980/month.`,
    };
  }

  // Get subscription benefits
  getSubscriptionBenefits(): {
    core: string[];
    addOns: string[];
    support: string[];
  } {
    return {
      core: [
        'WhatsApp Business automation',
        'QR code payment processing',
        'Digital invoicing system',
        'Order management platform',
        'Customer database management',
        'Basic analytics and reporting',
        'Mobile app access',
        'PWA access for offline use',
      ],
      addOns: [
        'Automated bookkeeping (R249/month)',
        'Managed backups (R99/month)',
        'Advanced analytics (R149/month)',
        'Priority support',
        'Custom integrations',
      ],
      support: [
        '1 support call per month (Basic)',
        '3 support calls per month (Premium)',
        'Unlimited support (Enterprise)',
        'Email support',
        'In-app chat support',
        'Video tutorials',
        'Documentation',
      ],
    };
  }

  // Get competitive advantages
  getCompetitiveAdvantages(): string[] {
    return [
      'South African focused pricing (ZAR)',
      'WhatsApp integration (familiar to SA businesses)',
      'Offline-first design (loadshedding resilient)',
      'Local payment gateways (PayFast, Yoco)',
      'SARS compliance built-in',
      'POPIA compliant data protection',
      'Mobile-first design (Android optimized)',
      'No hidden fees or setup costs',
      'Transparent pricing model',
      'Local support and training',
    ];
  }

  // Get target market
  getTargetMarket(): {
    primary: string[];
    secondary: string[];
    characteristics: string[];
  } {
    return {
      primary: [
        'Spaza shops and corner stores',
        'Food vendors and street food',
        'Hair salons and barbershops',
        'Small retail stores',
        'Service providers (plumbers, electricians)',
        'Informal traders',
      ],
      secondary: [
        'Medium-sized retail businesses',
        'Restaurants and cafes',
        'Beauty and wellness services',
        'Professional services',
        'Community organizations',
        'NGOs and non-profits',
      ],
      characteristics: [
        'Annual revenue: R50,000 - R2,000,000',
        'Employees: 1-20 people',
        'Location: Urban and peri-urban areas',
        'Technology: Basic smartphone users',
        'Payment preference: Cash and mobile payments',
        'Communication: WhatsApp users',
        'Language: English, Afrikaans, local languages',
      ],
    };
  }
}

// Export singleton instance
export default new PricingModelService();
