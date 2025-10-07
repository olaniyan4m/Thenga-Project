import { Router, Request, Response } from 'express';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class MessageController {
  public router: Router;
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.router = Router();
    this.whatsappService = whatsappService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/send-text', this.sendTextMessage.bind(this));
    this.router.post('/send-template', this.sendTemplateMessage.bind(this));
    this.router.post('/send-button', this.sendButtonMessage.bind(this));
    this.router.post('/send-list', this.sendListMessage.bind(this));
    this.router.post('/send-order-confirmation', this.sendOrderConfirmation.bind(this));
    this.router.post('/send-payment-notification', this.sendPaymentNotification.bind(this));
    this.router.post('/send-order-ready', this.sendOrderReady.bind(this));
    this.router.get('/status/:messageId', this.getMessageStatus.bind(this));
  }

  // Validation schemas
  private textMessageSchema = Joi.object({
    to: Joi.string().required(),
    message: Joi.string().required(),
  });

  private templateMessageSchema = Joi.object({
    to: Joi.string().required(),
    templateName: Joi.string().required(),
    languageCode: Joi.string().default('en_US'),
    components: Joi.array().optional(),
  });

  private buttonMessageSchema = Joi.object({
    to: Joi.string().required(),
    headerText: Joi.string().required(),
    bodyText: Joi.string().required(),
    footerText: Joi.string().required(),
    buttons: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        title: Joi.string().required(),
      })
    ).min(1).max(3).required(),
  });

  private listMessageSchema = Joi.object({
    to: Joi.string().required(),
    headerText: Joi.string().required(),
    bodyText: Joi.string().required(),
    footerText: Joi.string().required(),
    buttonText: Joi.string().required(),
    sections: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        rows: Joi.array().items(
          Joi.object({
            id: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().optional(),
          })
        ).min(1).max(10).required(),
      })
    ).min(1).max(10).required(),
  });

  private orderConfirmationSchema = Joi.object({
    customerPhone: Joi.string().required(),
    orderNumber: Joi.string().required(),
    totalAmount: Joi.number().positive().required(),
    items: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
      })
    ).min(1).required(),
  });

  private paymentNotificationSchema = Joi.object({
    customerPhone: Joi.string().required(),
    orderNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().required(),
  });

  private orderReadySchema = Joi.object({
    customerPhone: Joi.string().required(),
    orderNumber: Joi.string().required(),
    pickupInstructions: Joi.string().optional(),
  });

  /**
   * Send text message
   */
  private async sendTextMessage(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.textMessageSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { to, message } = value;
      const success = await this.whatsappService.sendTextMessage(to, message);

      if (success) {
        res.json({ success: true, message: 'Text message sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send text message' });
      }
    } catch (error) {
      logger.error('Error sending text message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send template message
   */
  private async sendTemplateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.templateMessageSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { to, templateName, languageCode, components } = value;
      const success = await this.whatsappService.sendTemplateMessage(
        to,
        templateName,
        languageCode,
        components
      );

      if (success) {
        res.json({ success: true, message: 'Template message sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send template message' });
      }
    } catch (error) {
      logger.error('Error sending template message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send button message
   */
  private async sendButtonMessage(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.buttonMessageSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { to, headerText, bodyText, footerText, buttons } = value;
      const success = await this.whatsappService.sendButtonMessage(
        to,
        headerText,
        bodyText,
        footerText,
        buttons
      );

      if (success) {
        res.json({ success: true, message: 'Button message sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send button message' });
      }
    } catch (error) {
      logger.error('Error sending button message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send list message
   */
  private async sendListMessage(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.listMessageSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { to, headerText, bodyText, footerText, buttonText, sections } = value;
      const success = await this.whatsappService.sendListMessage(
        to,
        headerText,
        bodyText,
        footerText,
        buttonText,
        sections
      );

      if (success) {
        res.json({ success: true, message: 'List message sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send list message' });
      }
    } catch (error) {
      logger.error('Error sending list message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send order confirmation
   */
  private async sendOrderConfirmation(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.orderConfirmationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { customerPhone, orderNumber, totalAmount, items } = value;
      const success = await this.whatsappService.sendOrderConfirmation(
        customerPhone,
        orderNumber,
        totalAmount,
        items
      );

      if (success) {
        res.json({ success: true, message: 'Order confirmation sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send order confirmation' });
      }
    } catch (error) {
      logger.error('Error sending order confirmation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send payment notification
   */
  private async sendPaymentNotification(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.paymentNotificationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { customerPhone, orderNumber, amount, paymentMethod } = value;
      const success = await this.whatsappService.sendPaymentNotification(
        customerPhone,
        orderNumber,
        amount,
        paymentMethod
      );

      if (success) {
        res.json({ success: true, message: 'Payment notification sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send payment notification' });
      }
    } catch (error) {
      logger.error('Error sending payment notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Send order ready notification
   */
  private async sendOrderReady(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.orderReadySchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { customerPhone, orderNumber, pickupInstructions } = value;
      const success = await this.whatsappService.sendOrderReadyNotification(
        customerPhone,
        orderNumber,
        pickupInstructions
      );

      if (success) {
        res.json({ success: true, message: 'Order ready notification sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send order ready notification' });
      }
    } catch (error) {
      logger.error('Error sending order ready notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get message status
   */
  private async getMessageStatus(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      
      if (!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
      }

      const status = await this.whatsappService.getMessageStatus(messageId);
      
      if (status) {
        res.json({ success: true, data: status });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      logger.error('Error getting message status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
