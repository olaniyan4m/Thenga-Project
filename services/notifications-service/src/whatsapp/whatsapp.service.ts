import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as QRCode from 'qrcode';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly webhookVerifyToken: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0');
    this.accessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN');
    this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
    this.webhookVerifyToken = this.configService.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
  }

  /**
   * Send a WhatsApp message using template
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = 'en',
    parameters: string[] = [],
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          components: parameters.length > 0 ? [
            {
              type: 'body',
              parameters: parameters.map(param => ({
                type: 'text',
                text: param,
              })),
            },
          ] : undefined,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`WhatsApp message sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`WhatsApp text message sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp text message to ${to}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send order confirmation with QR code
   */
  async sendOrderConfirmation(
    to: string,
    orderNumber: string,
    totalAmount: number,
    paymentUrl: string,
    merchantName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Generate QR code for payment
      const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);
      
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: 'order_confirmation',
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: orderNumber },
                { type: 'text', text: merchantName },
                { type: 'text', text: `R${totalAmount.toFixed(2)}` },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                { type: 'text', text: paymentUrl },
              ],
            },
          ],
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`WhatsApp order confirmation sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp order confirmation to ${to}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send payment link
   */
  async sendPaymentLink(
    to: string,
    paymentUrl: string,
    amount: number,
    merchantName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: 'payment_link',
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: merchantName },
                { type: 'text', text: `R${amount.toFixed(2)}` },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                { type: 'text', text: paymentUrl },
              ],
            },
          ],
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`WhatsApp payment link sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp payment link to ${to}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Verify webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      this.logger.log('WhatsApp webhook verified successfully');
      return challenge;
    }
    return null;
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(body: any): Promise<void> {
    try {
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await this.handleMessageStatus(change.value);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
    }
  }

  /**
   * Handle message status updates
   */
  private async handleMessageStatus(value: any): Promise<void> {
    // Handle message status updates (delivered, read, etc.)
    this.logger.log('WhatsApp message status update:', value);
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with +27
    if (digits.startsWith('0')) {
      return '+27' + digits.substring(1);
    }
    
    // If it starts with 27, add +
    if (digits.startsWith('27')) {
      return '+' + digits;
    }
    
    // If it already has +, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: assume it's a South African number without country code
    return '+27' + digits;
  }
}
