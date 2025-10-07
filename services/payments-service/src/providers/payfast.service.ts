import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

export interface PayFastPaymentRequest {
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
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
}

export interface PayFastPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

@Injectable()
export class PayFastService {
  private readonly logger = new Logger(PayFastService.name);
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly passphrase: string;
  private readonly baseUrl: string;
  private readonly sandbox: boolean;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get('PAYFAST_MERCHANT_ID');
    this.merchantKey = this.configService.get('PAYFAST_MERCHANT_KEY');
    this.passphrase = this.configService.get('PAYFAST_PASSPHRASE');
    this.sandbox = this.configService.get('PAYFAST_SANDBOX', 'true') === 'true';
    this.baseUrl = this.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  /**
   * Create a PayFast payment request
   */
  async createPayment(paymentData: PayFastPaymentRequest): Promise<PayFastPaymentResponse> {
    try {
      // Add merchant credentials
      const paymentRequest = {
        ...paymentData,
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
      };

      // Generate signature
      const signature = this.generateSignature(paymentRequest);
      paymentRequest['signature'] = signature;

      // Remove empty values
      const cleanRequest = this.removeEmptyValues(paymentRequest);

      this.logger.log(`Creating PayFast payment for amount R${paymentData.amount}`);

      return {
        success: true,
        paymentUrl: `${this.baseUrl}?${this.buildQueryString(cleanRequest)}`,
      };
    } catch (error) {
      this.logger.error('Failed to create PayFast payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify PayFast ITN (Instant Transaction Notification)
   */
  async verifyITN(data: any): Promise<{ valid: boolean; data?: any; error?: string }> {
    try {
      // Extract signature from data
      const { signature, ...paymentData } = data;
      
      // Generate expected signature
      const expectedSignature = this.generateSignature(paymentData);
      
      if (signature !== expectedSignature) {
        this.logger.warn('PayFast ITN signature verification failed');
        return { valid: false, error: 'Invalid signature' };
      }

      // Verify with PayFast
      const verifyUrl = this.sandbox 
        ? 'https://sandbox.payfast.co.za/eng/query/validate'
        : 'https://www.payfast.co.za/eng/query/validate';

      const response = await axios.post(verifyUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data === 'VALID') {
        this.logger.log('PayFast ITN verified successfully');
        return { valid: true, data: paymentData };
      } else {
        this.logger.warn('PayFast ITN verification failed');
        return { valid: false, error: 'ITN verification failed' };
      }
    } catch (error) {
      this.logger.error('Error verifying PayFast ITN:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Generate PayFast signature
   */
  private generateSignature(data: any): string {
    // Remove signature and empty values
    const cleanData = this.removeEmptyValues(data);
    delete cleanData.signature;

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(cleanData).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(cleanData[key])}`)
      .join('&');

    // Add passphrase if provided
    const finalString = this.passphrase 
      ? `${queryString}&passphrase=${this.passphrase}`
      : queryString;

    // Generate MD5 hash
    return crypto.createHash('md5').update(finalString).digest('hex');
  }

  /**
   * Remove empty values from object
   */
  private removeEmptyValues(obj: any): any {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Build query string from object
   */
  private buildQueryString(obj: any): string {
    return Object.keys(obj)
      .map(key => `${key}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(merchantPaymentId: string): Promise<any> {
    try {
      const queryUrl = this.sandbox 
        ? 'https://sandbox.payfast.co.za/eng/query/fetch'
        : 'https://www.payfast.co.za/eng/query/fetch';

      const response = await axios.post(queryUrl, {
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
        m_payment_id: merchantPaymentId,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error fetching payment status:', error);
      throw error;
    }
  }
}
