import { Analytics as AmplitudeAnalytics } from '@amplitude/analytics-node';
import Mixpanel from 'mixpanel';
import { logger } from '../utils/logger';

export interface UserEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  merchantId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId: string;
  properties: Record<string, any>;
  merchantId?: string;
}

export interface RevenueEvent {
  userId: string;
  revenue: number;
  currency: string;
  productId?: string;
  orderId?: string;
  merchantId?: string;
}

export class AnalyticsService {
  private amplitude: AmplitudeAnalytics;
  private mixpanel: Mixpanel.Mixpanel;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    try {
      // Initialize Amplitude
      if (process.env.AMPLITUDE_API_KEY) {
        this.amplitude = new AmplitudeAnalytics(process.env.AMPLITUDE_API_KEY);
        this.isInitialized = true;
        logger.info('Amplitude analytics initialized');
      }

      // Initialize Mixpanel
      if (process.env.MIXPANEL_TOKEN) {
        this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
        logger.info('Mixpanel analytics initialized');
      }

      if (!this.isInitialized) {
        logger.warn('No analytics services configured');
      }
    } catch (error) {
      logger.error('Error initializing analytics services:', error);
    }
  }

  /**
   * Track user event
   */
  async trackEvent(event: UserEvent): Promise<void> {
    try {
      if (!this.isInitialized) {
        logger.warn('Analytics not initialized, skipping event tracking');
        return;
      }

      const eventData = {
        user_id: event.userId,
        event_type: event.event,
        event_properties: {
          ...event.properties,
          merchant_id: event.merchantId,
          session_id: event.sessionId,
        },
        time: event.timestamp?.getTime() || Date.now(),
      };

      // Send to Amplitude
      if (this.amplitude) {
        await this.amplitude.track(eventData);
      }

      // Send to Mixpanel
      if (this.mixpanel) {
        this.mixpanel.track(event.event, {
          distinct_id: event.userId,
          ...event.properties,
          merchant_id: event.merchantId,
          session_id: event.sessionId,
        });
      }

      logger.info(`Event tracked: ${event.event} for user ${event.userId}`);
    } catch (error) {
      logger.error('Error tracking event:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(userProps: UserProperties): Promise<void> {
    try {
      if (!this.isInitialized) {
        logger.warn('Analytics not initialized, skipping user properties');
        return;
      }

      // Send to Amplitude
      if (this.amplitude) {
        await this.amplitude.identify({
          user_id: userProps.userId,
          user_properties: userProps.properties,
        });
      }

      // Send to Mixpanel
      if (this.mixpanel) {
        this.mixpanel.people.set(userProps.userId, {
          ...userProps.properties,
          merchant_id: userProps.merchantId,
        });
      }

      logger.info(`User properties set for user ${userProps.userId}`);
    } catch (error) {
      logger.error('Error setting user properties:', error);
    }
  }

  /**
   * Track revenue event
   */
  async trackRevenue(revenue: RevenueEvent): Promise<void> {
    try {
      if (!this.isInitialized) {
        logger.warn('Analytics not initialized, skipping revenue tracking');
        return;
      }

      const revenueData = {
        user_id: revenue.userId,
        event_type: 'revenue',
        event_properties: {
          revenue: revenue.revenue,
          currency: revenue.currency,
          product_id: revenue.productId,
          order_id: revenue.orderId,
          merchant_id: revenue.merchantId,
        },
        time: Date.now(),
      };

      // Send to Amplitude
      if (this.amplitude) {
        await this.amplitude.track(revenueData);
      }

      // Send to Mixpanel
      if (this.mixpanel) {
        this.mixpanel.track('Revenue', {
          distinct_id: revenue.userId,
          revenue: revenue.revenue,
          currency: revenue.currency,
          product_id: revenue.productId,
          order_id: revenue.orderId,
          merchant_id: revenue.merchantId,
        });
      }

      logger.info(`Revenue tracked: ${revenue.revenue} ${revenue.currency} for user ${revenue.userId}`);
    } catch (error) {
      logger.error('Error tracking revenue:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string, page: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'page_viewed',
      properties: {
        page,
        ...properties,
      },
    });
  }

  /**
   * Track user login
   */
  async trackLogin(userId: string, method: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'user_login',
      properties: {
        login_method: method,
      },
      merchantId,
    });
  }

  /**
   * Track user registration
   */
  async trackRegistration(userId: string, method: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'user_registration',
      properties: {
        registration_method: method,
      },
      merchantId,
    });
  }

  /**
   * Track order creation
   */
  async trackOrderCreated(userId: string, orderId: string, totalAmount: number, itemCount: number, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'order_created',
      properties: {
        order_id: orderId,
        total_amount: totalAmount,
        item_count: itemCount,
      },
      merchantId,
    });

    // Track revenue
    await this.trackRevenue({
      userId,
      revenue: totalAmount,
      currency: 'ZAR',
      orderId,
      merchantId,
    });
  }

  /**
   * Track order completion
   */
  async trackOrderCompleted(userId: string, orderId: string, totalAmount: number, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'order_completed',
      properties: {
        order_id: orderId,
        total_amount: totalAmount,
      },
      merchantId,
    });
  }

  /**
   * Track payment success
   */
  async trackPaymentSuccess(userId: string, paymentId: string, amount: number, method: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'payment_success',
      properties: {
        payment_id: paymentId,
        amount,
        payment_method: method,
      },
      merchantId,
    });
  }

  /**
   * Track product view
   */
  async trackProductView(userId: string, productId: string, productName: string, category: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'product_viewed',
      properties: {
        product_id: productId,
        product_name: productName,
        category,
      },
      merchantId,
    });
  }

  /**
   * Track WhatsApp message sent
   */
  async trackWhatsAppMessage(userId: string, messageType: string, recipient: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'whatsapp_message_sent',
      properties: {
        message_type: messageType,
        recipient,
      },
      merchantId,
    });
  }

  /**
   * Track inventory update
   */
  async trackInventoryUpdate(userId: string, productId: string, action: string, quantity: number, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'inventory_updated',
      properties: {
        product_id: productId,
        action,
        quantity,
      },
      merchantId,
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, feature: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'feature_used',
      properties: {
        feature,
      },
      merchantId,
    });
  }

  /**
   * Track error
   */
  async trackError(userId: string, error: string, context: string, merchantId?: string): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'error_occurred',
      properties: {
        error,
        context,
      },
      merchantId,
    });
  }

  /**
   * Get user analytics summary
   */
  async getUserAnalytics(userId: string): Promise<{
    totalEvents: number;
    lastActive: Date;
    favoriteFeatures: string[];
    totalRevenue: number;
  }> {
    // This would typically query your analytics database
    // For now, return mock data
    return {
      totalEvents: 0,
      lastActive: new Date(),
      favoriteFeatures: [],
      totalRevenue: 0,
    };
  }

  /**
   * Get merchant analytics summary
   */
  async getMerchantAnalytics(merchantId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    topProducts: Array<{ productId: string; name: string; sales: number }>;
  }> {
    // This would typically query your analytics database
    // For now, return mock data
    return {
      totalOrders: 0,
      totalRevenue: 0,
      activeUsers: 0,
      topProducts: [],
    };
  }
}
