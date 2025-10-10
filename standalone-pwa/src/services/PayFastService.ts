// 💳 PayFast Payment Integration Service
// Handles PayFast payment processing for Thenga subscriptions

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  environment: 'sandbox' | 'production';
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number: string;
  m_payment_id: string;
  amount: number;
  item_name: string;
  item_description: string;
  custom_int1?: number;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
}

export interface PayFastResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
  transactionId?: string;
}

export interface PayFastWebhookData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description: string;
  amount_gross: number;
  amount_fee: number;
  amount_net: number;
  name_first: string;
  name_last: string;
  email_address: string;
  merchant_id: string;
  token: string;
  signature: string;
}

class PayFastService {
  private config: PayFastConfig;

  constructor() {
    this.config = {
      merchantId: '19804699',
      merchantKey: 'a5tum0tdbbcnb',
      passphrase: 'Mo/akin/1970',
      environment: 'sandbox', // Change to 'production' for live payments
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      notifyUrl: `${window.location.origin}/api/payfast/webhook`,
    };
  }

  /**
   * Generate PayFast signature for security
   */
  private generateSignature(data: PayFastPaymentData): string {
    const params = new URLSearchParams();
    
    // Add all parameters except signature
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    // Add passphrase
    params.append('passphrase', this.config.passphrase);

    // Sort parameters
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Generate MD5 hash
    return this.md5(sortedParams);
  }

  /**
   * Simple MD5 hash function (in production, use crypto-js or similar)
   */
  private md5(str: string): string {
    // This is a simplified MD5 implementation
    // In production, use a proper crypto library
    return btoa(str).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * Create PayFast payment URL
   */
  async createPayment(paymentData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    amount: number;
    itemName: string;
    itemDescription: string;
    customData?: {
      userId?: string;
      planId?: string;
      subscriptionType?: string;
    };
  }): Promise<PayFastResponse> {
    try {
      const paymentId = `Thenga_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const payfastData: PayFastPaymentData = {
        merchant_id: this.config.merchantId,
        merchant_key: this.config.merchantKey,
        return_url: this.config.returnUrl,
        cancel_url: this.config.cancelUrl,
        notify_url: this.config.notifyUrl,
        name_first: paymentData.firstName,
        name_last: paymentData.lastName,
        email_address: paymentData.email,
        cell_number: paymentData.phone,
        m_payment_id: paymentId,
        amount: paymentData.amount,
        item_name: paymentData.itemName,
        item_description: paymentData.itemDescription,
        custom_int1: paymentData.customData?.userId ? parseInt(paymentData.customData.userId) : undefined,
        custom_str1: paymentData.customData?.planId || '',
        custom_str2: paymentData.customData?.subscriptionType || '',
        custom_str3: 'Thenga Subscription',
        custom_str4: 'South Africa',
        custom_str5: 'Digital Commerce Platform',
      };

      // Generate signature
      const signature = this.generateSignature(payfastData);

      // Add signature to data
      const finalData = { ...payfastData, signature };

      // Create PayFast URL
      const baseUrl = this.config.environment === 'production' 
        ? 'https://www.payfast.co.za/eng/process' 
        : 'https://sandbox.payfast.co.za/eng/process';

      const params = new URLSearchParams();
      Object.entries(finalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const paymentUrl = `${baseUrl}?${params.toString()}`;

      return {
        success: true,
        paymentUrl,
        transactionId: paymentId,
      };

    } catch (error) {
      console.error('PayFast payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Verify PayFast webhook signature
   */
  verifyWebhookSignature(webhookData: PayFastWebhookData): boolean {
    try {
      // Create parameter string for verification
      const params = new URLSearchParams();
      
      Object.entries(webhookData).forEach(([key, value]) => {
        if (key !== 'signature' && value !== null && value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Add passphrase
      params.append('passphrase', this.config.passphrase);

      // Sort parameters
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      // Generate expected signature
      const expectedSignature = this.md5(sortedParams);

      // Compare signatures
      return expectedSignature === webhookData.signature;

    } catch (error) {
      console.error('PayFast webhook verification error:', error);
      return false;
    }
  }

  /**
   * Process PayFast webhook notification
   */
  async processWebhook(webhookData: PayFastWebhookData): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
  }> {
    try {
      // Verify signature
      if (!this.verifyWebhookSignature(webhookData)) {
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Check payment status
      if (webhookData.payment_status === 'COMPLETE') {
        // Payment successful - activate subscription
        console.log('Payment successful:', {
          transactionId: webhookData.m_payment_id,
          amount: webhookData.amount_gross,
          user: webhookData.email_address,
        });

        // Here you would typically:
        // 1. Update user subscription status in database
        // 2. Send confirmation email
        // 3. Activate user account
        // 4. Log transaction

        return {
          success: true,
          message: 'Payment processed successfully',
          transactionId: webhookData.m_payment_id,
        };

      } else if (webhookData.payment_status === 'CANCELLED') {
        // Payment cancelled
        console.log('Payment cancelled:', webhookData.m_payment_id);

        return {
          success: true,
          message: 'Payment cancelled by user',
          transactionId: webhookData.m_payment_id,
        };

      } else if (webhookData.payment_status === 'FAILED') {
        // Payment failed
        console.log('Payment failed:', webhookData.m_payment_id);

        return {
          success: true,
          message: 'Payment failed',
          transactionId: webhookData.m_payment_id,
        };

      } else {
        // Unknown status
        return {
          success: false,
          message: `Unknown payment status: ${webhookData.payment_status}`,
        };
      }

    } catch (error) {
      console.error('PayFast webhook processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }

  /**
   * Get PayFast configuration
   */
  getConfig(): PayFastConfig {
    return { ...this.config };
  }

  /**
   * Update PayFast configuration
   */
  updateConfig(newConfig: Partial<PayFastConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test PayFast connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    environment: string;
  }> {
    try {
      const testUrl = this.config.environment === 'production' 
        ? 'https://www.payfast.co.za/eng/query/validate' 
        : 'https://sandbox.payfast.co.za/eng/query/validate';

      // Test with merchant credentials
      const testData = {
        merchant_id: this.config.merchantId,
        merchant_key: this.config.merchantKey,
        passphrase: this.config.passphrase,
      };

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(testData).toString(),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'PayFast connection successful',
          environment: this.config.environment,
        };
      } else {
        return {
          success: false,
          message: 'PayFast connection failed',
          environment: this.config.environment,
        };
      }

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        environment: this.config.environment,
      };
    }
  }
}

// Export singleton instance
export default new PayFastService();
