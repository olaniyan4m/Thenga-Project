import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface YocoPaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  customer?: {
    email?: string;
    phone?: string;
  };
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface YocoPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface YocoWebhookData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class YocoService {
  private readonly logger = new Logger(YocoService.name);
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly baseUrl: string;
  private readonly sandbox: boolean;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('YOCO_SECRET_KEY');
    this.publicKey = this.configService.get('YOCO_PUBLIC_KEY');
    this.sandbox = this.configService.get('YOCO_SANDBOX', 'true') === 'true';
    this.baseUrl = this.sandbox 
      ? 'https://api.yoco.com/v1'
      : 'https://api.yoco.com/v1';
  }

  /**
   * Create a Yoco payment request
   */
  async createPayment(paymentData: YocoPaymentRequest): Promise<YocoPaymentResponse> {
    try {
      const url = `${this.baseUrl}/charges`;
      
      const payload = {
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency,
        reference: paymentData.reference,
        description: paymentData.description,
        customer: paymentData.customer,
        redirectUrl: paymentData.redirectUrl,
        webhookUrl: paymentData.webhookUrl,
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Yoco payment created successfully: ${response.data.id}`);

      return {
        success: true,
        paymentUrl: response.data.url,
        paymentId: response.data.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Yoco payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify Yoco webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error('Error verifying Yoco webhook signature:', error);
      return false;
    }
  }

  /**
   * Process Yoco webhook
   */
  async processWebhook(webhookData: YocoWebhookData): Promise<{ processed: boolean; error?: string }> {
    try {
      this.logger.log(`Processing Yoco webhook for payment ${webhookData.id}`);

      // Update payment status based on webhook data
      switch (webhookData.status) {
        case 'successful':
          // Payment successful
          this.logger.log(`Payment ${webhookData.id} completed successfully`);
          break;
        case 'failed':
          // Payment failed
          this.logger.log(`Payment ${webhookData.id} failed`);
          break;
        case 'cancelled':
          // Payment cancelled
          this.logger.log(`Payment ${webhookData.id} was cancelled`);
          break;
        default:
          this.logger.warn(`Unknown payment status: ${webhookData.status}`);
      }

      return { processed: true };
    } catch (error) {
      this.logger.error('Error processing Yoco webhook:', error);
      return { processed: false, error: error.message };
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/charges/${paymentId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching Yoco payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}/charges/${paymentId}/refund`;
      
      const payload = amount ? { amount: Math.round(amount * 100) } : {};

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Yoco refund created successfully: ${response.data.id}`);

      return {
        success: true,
        refundId: response.data.id,
      };
    } catch (error) {
      this.logger.error(`Failed to refund Yoco payment ${paymentId}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Create a payment link for mobile/web
   */
  async createPaymentLink(paymentData: YocoPaymentRequest): Promise<YocoPaymentResponse> {
    try {
      const url = `${this.baseUrl}/payment-links`;
      
      const payload = {
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency,
        reference: paymentData.reference,
        description: paymentData.description,
        customer: paymentData.customer,
        redirectUrl: paymentData.redirectUrl,
        webhookUrl: paymentData.webhookUrl,
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Yoco payment link created successfully: ${response.data.id}`);

      return {
        success: true,
        paymentUrl: response.data.url,
        paymentId: response.data.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Yoco payment link:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }
}
