import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export interface WhatsAppWebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export class WhatsAppService {
  private client: AxiosInstance;
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (!this.accessToken || !this.phoneNumberId || !this.businessAccountId) {
      logger.warn('WhatsApp configuration incomplete. Some features may not work.');
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        to,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`Text message sent to ${to}:`, response.data);
      return true;
    } catch (error) {
      logger.error('Failed to send text message:', error);
      return false;
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components?: any[]
  ): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      };

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`Template message sent to ${to}:`, response.data);
      return true;
    } catch (error) {
      logger.error('Failed to send template message:', error);
      return false;
    }
  }

  /**
   * Send an interactive button message
   */
  async sendButtonMessage(
    to: string,
    headerText: string,
    bodyText: string,
    footerText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: headerText,
          },
          body: {
            text: bodyText,
          },
          footer: {
            text: footerText,
          },
          action: {
            buttons: buttons.map(button => ({
              type: 'reply' as const,
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      };

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`Button message sent to ${to}:`, response.data);
      return true;
    } catch (error) {
      logger.error('Failed to send button message:', error);
      return false;
    }
  }

  /**
   * Send an interactive list message
   */
  async sendListMessage(
    to: string,
    headerText: string,
    bodyText: string,
    footerText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: {
            type: 'text',
            text: headerText,
          },
          body: {
            text: bodyText,
          },
          footer: {
            text: footerText,
          },
          action: {
            sections: sections.map(section => ({
              title: section.title,
              rows: section.rows.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
              })),
            })),
          },
        },
      };

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`List message sent to ${to}:`, response.data);
      return true;
    } catch (error) {
      logger.error('Failed to send list message:', error);
      return false;
    }
  }

  /**
   * Send order confirmation message
   */
  async sendOrderConfirmation(
    customerPhone: string,
    orderNumber: string,
    totalAmount: number,
    items: Array<{ name: string; quantity: number; price: number }>
  ): Promise<boolean> {
    const message = `🎉 *Order Confirmed!*

📋 *Order #${orderNumber}*

${items.map(item => `• ${item.name} x${item.quantity} - R${item.price.toFixed(2)}`).join('\n')}

💰 *Total: R${totalAmount.toFixed(2)}*

Thank you for choosing us! We'll notify you when your order is ready.`;

    return this.sendTextMessage(customerPhone, message);
  }

  /**
   * Send payment received notification
   */
  async sendPaymentNotification(
    customerPhone: string,
    orderNumber: string,
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    const message = `💳 *Payment Received!*

📋 Order #${orderNumber}
💰 Amount: R${amount.toFixed(2)}
💳 Method: ${paymentMethod}

Your payment has been processed successfully. Thank you!`;

    return this.sendTextMessage(customerPhone, message);
  }

  /**
   * Send order ready notification
   */
  async sendOrderReadyNotification(
    customerPhone: string,
    orderNumber: string,
    pickupInstructions?: string
  ): Promise<boolean> {
    let message = `✅ *Your Order is Ready!*

📋 Order #${orderNumber}

Your order is ready for pickup!`;

    if (pickupInstructions) {
      message += `\n\n📍 *Pickup Instructions:*
${pickupInstructions}`;
    }

    return this.sendTextMessage(customerPhone, message);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const appSecret = process.env.WHATSAPP_APP_SECRET || '';
    
    if (!appSecret) {
      logger.warn('WhatsApp app secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${messageId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get message status:', error);
      return null;
    }
  }
}
