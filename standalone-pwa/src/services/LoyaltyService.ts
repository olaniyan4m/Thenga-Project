// 🎁 Loyalty & Coupons Service
// Real integration with loyalty programs, coupon systems, and airtime services

export interface LoyaltyConfig {
  provider: 'amplitude' | 'mixpanel' | 'segment' | 'airtime_provider' | 'coupon_system';
  apiKey: string;
  environment: 'sandbox' | 'production';
  merchantId: string;
  programId?: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'tier' | 'stamp' | 'referral';
  rules: {
    earnRate: number; // points per R1 spent
    redemptionRate: number; // R1 per point
    minimumRedemption: number;
    expiryDays?: number;
  };
  tiers?: Array<{
    name: string;
    minimumSpend: number;
    benefits: string[];
    multiplier: number;
  }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface Customer {
  id: string;
  phone: string;
  email?: string;
  name: string;
  points: number;
  tier: string;
  totalSpent: number;
  joinDate: string;
  lastActivity: string;
  preferences: {
    notifications: boolean;
    sms: boolean;
    email: boolean;
  };
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  minimumSpend?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface AirtimeProvider {
  id: string;
  name: string;
  logo: string;
  networks: string[];
  denominations: number[];
  isAvailable: boolean;
}

export interface AirtimeTopUp {
  id: string;
  customerPhone: string;
  amount: number;
  network: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  timestamp: string;
  error?: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  description: string;
  orderId?: string;
  timestamp: string;
  expiryDate?: string;
}

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  referrerReward: number;
  refereeReward: number;
  minimumPurchase?: number;
  isActive: boolean;
  expiryDate?: string;
}

class LoyaltyService {
  private config: LoyaltyConfig;
  private isAuthenticated: boolean = false;

  constructor(config: LoyaltyConfig) {
    this.config = config;
  }

  /**
   * Authenticate with loyalty service
   */
  async authenticate(): Promise<boolean> {
    try {
      const authResult = await this.performAuthentication();
      this.isAuthenticated = authResult.success;
      return authResult.success;
    } catch (error) {
      console.error('Loyalty service authentication failed:', error);
      return false;
    }
  }

  /**
   * Create loyalty program
   */
  async createLoyaltyProgram(program: Omit<LoyaltyProgram, 'id'>): Promise<LoyaltyProgram> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const result = await this.submitLoyaltyProgram(program);
      return result;
    } catch (error) {
      console.error('Loyalty program creation failed:', error);
      throw error;
    }
  }

  /**
   * Register customer in loyalty program
   */
  async registerCustomer(customer: Omit<Customer, 'id' | 'points' | 'tier' | 'totalSpent' | 'joinDate' | 'lastActivity'>): Promise<Customer> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const result = await this.submitCustomerRegistration(customer);
      return result;
    } catch (error) {
      console.error('Customer registration failed:', error);
      throw error;
    }
  }

  /**
   * Earn points for customer
   */
  async earnPoints(customerId: string, amount: number, orderId?: string): Promise<LoyaltyTransaction> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const transaction = await this.submitPointsEarning(customerId, amount, orderId);
      return transaction;
    } catch (error) {
      console.error('Points earning failed:', error);
      throw error;
    }
  }

  /**
   * Redeem points for customer
   */
  async redeemPoints(customerId: string, points: number, orderId?: string): Promise<LoyaltyTransaction> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const transaction = await this.submitPointsRedemption(customerId, points, orderId);
      return transaction;
    } catch (error) {
      console.error('Points redemption failed:', error);
      throw error;
    }
  }

  /**
   * Create coupon
   */
  async createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const result = await this.submitCoupon(coupon);
      return result;
    } catch (error) {
      console.error('Coupon creation failed:', error);
      throw error;
    }
  }

  /**
   * Validate and apply coupon
   */
  async applyCoupon(couponCode: string, orderAmount: number, customerId?: string): Promise<{ valid: boolean; discount: number; error?: string }> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const result = await this.validateCoupon(couponCode, orderAmount, customerId);
      return result;
    } catch (error) {
      console.error('Coupon application failed:', error);
      throw error;
    }
  }

  /**
   * Get available airtime providers
   */
  async getAirtimeProviders(): Promise<AirtimeProvider[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const providers = await this.fetchAirtimeProviders();
      return providers;
    } catch (error) {
      console.error('Failed to get airtime providers:', error);
      throw error;
    }
  }

  /**
   * Process airtime top-up
   */
  async processAirtimeTopUp(customerPhone: string, amount: number, network: string): Promise<AirtimeTopUp> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const topUp = await this.submitAirtimeTopUp(customerPhone, amount, network);
      return topUp;
    } catch (error) {
      console.error('Airtime top-up failed:', error);
      throw error;
    }
  }

  /**
   * Get customer loyalty status
   */
  async getCustomerStatus(customerId: string): Promise<Customer> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const customer = await this.fetchCustomerStatus(customerId);
      return customer;
    } catch (error) {
      console.error('Failed to get customer status:', error);
      throw error;
    }
  }

  /**
   * Get loyalty analytics
   */
  async getLoyaltyAnalytics(programId: string, period: 'day' | 'week' | 'month'): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with loyalty service');
    }

    try {
      const analytics = await this.fetchLoyaltyAnalytics(programId, period);
      return analytics;
    } catch (error) {
      console.error('Failed to get loyalty analytics:', error);
      throw error;
    }
  }

  /**
   * Perform authentication with loyalty service
   */
  private async performAuthentication(): Promise<{ success: boolean; error?: string }> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    try {
      const response = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          program_id: this.config.programId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Authentication failed' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit loyalty program
   */
  private async submitLoyaltyProgram(program: any): Promise<LoyaltyProgram> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loyalty-programs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(program)
    });

    if (!response.ok) {
      throw new Error(`Loyalty program creation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit customer registration
   */
  private async submitCustomerRegistration(customer: any): Promise<Customer> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...customer,
        points: 0,
        tier: 'Bronze',
        totalSpent: 0,
        joinDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Customer registration failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit points earning
   */
  private async submitPointsEarning(customerId: string, amount: number, orderId?: string): Promise<LoyaltyTransaction> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loyalty-transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        customer_id: customerId,
        type: 'earn',
        points: amount,
        description: `Earned ${amount} points`,
        order_id: orderId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Points earning failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit points redemption
   */
  private async submitPointsRedemption(customerId: string, points: number, orderId?: string): Promise<LoyaltyTransaction> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loyalty-transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        customer_id: customerId,
        type: 'redeem',
        points: -points,
        description: `Redeemed ${points} points`,
        order_id: orderId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Points redemption failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit coupon
   */
  private async submitCoupon(coupon: any): Promise<Coupon> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/coupons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...coupon,
        usedCount: 0
      })
    });

    if (!response.ok) {
      throw new Error(`Coupon creation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Validate coupon
   */
  private async validateCoupon(couponCode: string, orderAmount: number, customerId?: string): Promise<{ valid: boolean; discount: number; error?: string }> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        code: couponCode,
        order_amount: orderAmount,
        customer_id: customerId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        discount: 0,
        error: errorData.message || 'Coupon validation failed'
      };
    }

    const result = await response.json();
    return {
      valid: result.valid,
      discount: result.discount || 0,
      error: result.error
    };
  }

  /**
   * Fetch airtime providers
   */
  private async fetchAirtimeProviders(): Promise<AirtimeProvider[]> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/airtime-providers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch airtime providers: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submit airtime top-up
   */
  private async submitAirtimeTopUp(customerPhone: string, amount: number, network: string): Promise<AirtimeTopUp> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/airtime-topup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        customer_phone: customerPhone,
        amount,
        network,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        id: '',
        customerPhone,
        amount,
        network,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: errorData.message || 'Airtime top-up failed'
      };
    }

    const result = await response.json();
    return {
      id: result.id,
      customerPhone,
      amount,
      network,
      status: result.status,
      transactionId: result.transaction_id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Fetch customer status
   */
  private async fetchCustomerStatus(customerId: string): Promise<Customer> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customer status: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch loyalty analytics
   */
  private async fetchLoyaltyAnalytics(programId: string, period: string): Promise<any> {
    const baseUrls = {
      amplitude: 'https://api.amplitude.com/v1',
      mixpanel: 'https://api.mixpanel.com/v1',
      segment: 'https://api.segment.io/v1',
      airtime_provider: 'https://api.airtime.co.za/v1',
      coupon_system: 'https://api.coupons.co.za/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loyalty-programs/${programId}/analytics?period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty analytics: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check if service is authenticated
   */
  isServiceAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}

export default LoyaltyService;
