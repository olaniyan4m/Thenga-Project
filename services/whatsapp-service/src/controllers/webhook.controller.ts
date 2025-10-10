import { Router, Request, Response } from 'express';
import { WhatsAppService, WhatsAppWebhookMessage } from '../whatsapp/whatsapp.service';
import { logger } from '../utils/logger';

export class WebhookController {
  public router: Router;
  private whatsappService: WhatsAppService;

  constructor(whatsappService: WhatsAppService) {
    this.router = Router();
    this.whatsappService = whatsappService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Webhook verification (GET)
    this.router.get('/', this.verifyWebhook.bind(this));
    
    // Webhook events (POST)
    this.router.post('/', this.handleWebhook.bind(this));
  }

  /**
   * Verify webhook endpoint
   */
  private async verifyWebhook(req: Request, res: Response): Promise<void> {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      logger.warn('Webhook verification failed');
      res.status(403).send('Forbidden');
    }
  }

  /**
   * Handle incoming webhook events
   */
  private async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      
      // Verify webhook signature
      const signature = req.headers['x-hub-signature-256'] as string;
      if (signature && !this.whatsappService.verifyWebhookSignature(JSON.stringify(body), signature)) {
        logger.warn('Invalid webhook signature');
        res.status(403).send('Forbidden');
        return;
      }

      // Handle different types of webhook events
      if (body.object === 'whatsapp_business_account') {
        await this.handleWhatsAppEvents(body);
      }

      res.status(200).send('OK');
    } catch (error) {
      logger.error('Webhook handling error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * Handle WhatsApp Business Account events
   */
  private async handleWhatsAppEvents(body: any): Promise<void> {
    const entries = body.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        if (change.field === 'messages') {
          await this.handleMessageEvents(change.value);
        }
      }
    }
  }

  /**
   * Handle message events
   */
  private async handleMessageEvents(value: any): Promise<void> {
    const messages = value.messages || [];
    const statuses = value.statuses || [];

    // Process incoming messages
    for (const message of messages) {
      await this.processIncomingMessage(message);
    }

    // Process message statuses
    for (const status of statuses) {
      await this.processMessageStatus(status);
    }
  }

  /**
   * Process incoming message
   */
  private async processIncomingMessage(message: WhatsAppWebhookMessage): Promise<void> {
    try {
      logger.info('Processing incoming message:', message);

      const { from, text, interactive } = message;

      if (text) {
        await this.handleTextMessage(from, text.body);
      } else if (interactive) {
        await this.handleInteractiveMessage(from, interactive);
      }
    } catch (error) {
      logger.error('Error processing incoming message:', error);
    }
  }

  /**
   * Handle text message
   */
  private async handleTextMessage(from: string, text: string): Promise<void> {
    logger.info(`Text message from ${from}: ${text}`);

    // Simple keyword-based responses
    const lowerText = text.toLowerCase();

    if (lowerText.includes('menu') || lowerText.includes('food')) {
      await this.sendMenuMessage(from);
    } else if (lowerText.includes('order') || lowerText.includes('buy')) {
      await this.sendOrderOptions(from);
    } else if (lowerText.includes('help') || lowerText.includes('support')) {
      await this.sendHelpMessage(from);
    } else {
      await this.sendWelcomeMessage(from);
    }
  }

  /**
   * Handle interactive message (buttons, lists)
   */
  private async handleInteractiveMessage(from: string, interactive: any): Promise<void> {
    logger.info(`Interactive message from ${from}:`, interactive);

    if (interactive.button_reply) {
      await this.handleButtonReply(from, interactive.button_reply);
    } else if (interactive.list_reply) {
      await this.handleListReply(from, interactive.list_reply);
    }
  }

  /**
   * Handle button reply
   */
  private async handleButtonReply(from: string, buttonReply: any): Promise<void> {
    const { id, title } = buttonReply;

    switch (id) {
      case 'view_menu':
        await this.sendMenuMessage(from);
        break;
      case 'place_order':
        await this.sendOrderOptions(from);
        break;
      case 'contact_support':
        await this.sendContactInfo(from);
        break;
      default:
        await this.sendWelcomeMessage(from);
    }
  }

  /**
   * Handle list reply
   */
  private async handleListReply(from: string, listReply: any): Promise<void> {
    const { id, title } = listReply;

    // Handle different menu selections
    if (id.startsWith('category_')) {
      const category = id.replace('category_', '');
      await this.sendCategoryItems(from, category);
    } else if (id.startsWith('item_')) {
      const itemId = id.replace('item_', '');
      await this.sendItemDetails(from, itemId);
    }
  }

  /**
   * Process message status
   */
  private async processMessageStatus(status: any): Promise<void> {
    logger.info('Message status update:', status);
    
    // Update message status in database
    // This would typically update your database with the message status
  }

  // Message sending methods
  private async sendWelcomeMessage(to: string): Promise<void> {
    const message = `👋 *Welcome to Thenga!*

I'm your digital assistant. How can I help you today?

Choose an option below:`;

    await this.whatsappService.sendButtonMessage(
      to,
      'Welcome!',
      message,
      'Thenga Digital Commerce',
      [
        { id: 'view_menu', title: '📋 View Menu' },
        { id: 'place_order', title: '🛒 Place Order' },
        { id: 'contact_support', title: '💬 Contact Support' }
      ]
    );
  }

  private async sendMenuMessage(to: string): Promise<void> {
    const message = `🍽️ *Our Menu*

Choose a category to see our delicious options:`;

    await this.whatsappService.sendListMessage(
      to,
      'Menu Categories',
      message,
      'Select a category',
      'View Menu',
      [
        {
          title: 'Food Categories',
          rows: [
            { id: 'category_main', title: '🍖 Main Dishes', description: 'Hearty main courses' },
            { id: 'category_sides', title: '🥗 Sides & Salads', description: 'Fresh sides and salads' },
            { id: 'category_drinks', title: '🥤 Beverages', description: 'Refreshing drinks' },
            { id: 'category_desserts', title: '🍰 Desserts', description: 'Sweet treats' }
          ]
        }
      ]
    );
  }

  private async sendOrderOptions(to: string): Promise<void> {
    const message = `🛒 *Place Your Order*

Ready to order? Here are your options:`;

    await this.whatsappService.sendButtonMessage(
      to,
      'Order Options',
      message,
      'Choose how you\'d like to order',
      [
        { id: 'browse_menu', title: '📋 Browse Menu' },
        { id: 'quick_order', title: '⚡ Quick Order' },
        { id: 'repeat_order', title: '🔄 Repeat Last Order' }
      ]
    );
  }

  private async sendHelpMessage(to: string): Promise<void> {
    const message = `🆘 *How Can I Help?*

Here are some things I can do for you:

• 📋 Show you our menu
• 🛒 Help you place an order
• 💳 Process payments
• 📞 Connect you with support
• 📍 Find our location

Just type what you need or use the buttons below!`;

    await this.whatsappService.sendTextMessage(to, message);
  }

  private async sendContactInfo(to: string): Promise<void> {
    const message = `📞 *Contact Information*

🏪 *Demo Coffee Shop*
📍 123 Main Street, Cape Town
📞 +27 21 123 4567
🕒 Mon-Fri: 8AM-6PM, Sat: 9AM-4PM

💬 *WhatsApp Support*
Available 24/7 for your convenience!

Is there anything specific I can help you with?`;

    await this.whatsappService.sendTextMessage(to, message);
  }

  private async sendCategoryItems(to: string, category: string): Promise<void> {
    // This would typically fetch from your database
    const message = `🍽️ *${category.charAt(0).toUpperCase() + category.slice(1)} Menu*

Here are our delicious options:`;

    await this.whatsappService.sendTextMessage(to, message);
  }

  private async sendItemDetails(to: string, itemId: string): Promise<void> {
    // This would typically fetch item details from your database
    const message = `🍽️ *Item Details*

Would you like to add this to your order?`;

    await this.whatsappService.sendTextMessage(to, message);
  }
}
