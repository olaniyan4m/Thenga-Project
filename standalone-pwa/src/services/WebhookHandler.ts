// 🔗 PayFast Webhook Handler
// Handles PayFast payment notifications and updates subscription status

import PayFastService from './PayFastService';

export interface WebhookEvent {
  type: 'payment_complete' | 'payment_cancelled' | 'payment_failed';
  transactionId: string;
  userId: string;
  planId: string;
  amount: number;
  timestamp: string;
  data: any;
}

export interface SubscriptionUpdate {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'failed' | 'trial';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  transactionId: string;
}

class WebhookHandler {
  private subscriptions: Map<string, SubscriptionUpdate> = new Map();

  /**
   * Process PayFast webhook notification
   */
  async processWebhook(webhookData: any): Promise<{
    success: boolean;
    message: string;
    event?: WebhookEvent;
  }> {
    try {
      console.log('Processing PayFast webhook:', webhookData);

      // Verify webhook signature
      const isValid = PayFastService.verifyWebhookSignature(webhookData);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Extract user and plan information from custom fields
      const userId = webhookData.custom_int1?.toString() || webhookData.email_address;
      const planId = webhookData.custom_str1 || 'basic_monthly';
      const subscriptionType = webhookData.custom_str2 || 'monthly';

      // Create webhook event
      const event: WebhookEvent = {
        type: this.mapPaymentStatusToEventType(webhookData.payment_status),
        transactionId: webhookData.m_payment_id,
        userId,
        planId,
        amount: parseFloat(webhookData.amount_gross),
        timestamp: new Date().toISOString(),
        data: webhookData,
      };

      // Process the event
      const result = await this.processEvent(event);

      return {
        success: true,
        message: result.message,
        event,
      };

    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }

  /**
   * Process webhook event and update subscription
   */
  private async processEvent(event: WebhookEvent): Promise<{ message: string }> {
    switch (event.type) {
      case 'payment_complete':
        return await this.handlePaymentComplete(event);
      case 'payment_cancelled':
        return await this.handlePaymentCancelled(event);
      case 'payment_failed':
        return await this.handlePaymentFailed(event);
      default:
        return { message: 'Unknown event type' };
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentComplete(event: WebhookEvent): Promise<{ message: string }> {
    try {
      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
      const nextBillingDate = new Date(endDate);

      // Create subscription record
      const subscription: SubscriptionUpdate = {
        userId: event.userId,
        planId: event.planId,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        amount: event.amount,
        transactionId: event.transactionId,
      };

      // Store subscription
      this.subscriptions.set(event.userId, subscription);

      // Log successful payment
      console.log('Payment completed successfully:', {
        userId: event.userId,
        planId: event.planId,
        amount: event.amount,
        transactionId: event.transactionId,
      });

      // In a real application, you would:
      // 1. Update database with subscription details
      // 2. Send confirmation email to user
      // 3. Activate user account
      // 4. Set up recurring billing
      // 5. Send notification to admin

      return { message: 'Payment processed successfully, subscription activated' };

    } catch (error) {
      console.error('Error handling payment completion:', error);
      return { message: 'Error processing payment completion' };
    }
  }

  /**
   * Handle cancelled payment
   */
  private async handlePaymentCancelled(event: WebhookEvent): Promise<{ message: string }> {
    try {
      console.log('Payment cancelled:', {
        userId: event.userId,
        transactionId: event.transactionId,
      });

      // In a real application, you would:
      // 1. Log the cancellation
      // 2. Send notification to user
      // 3. Clean up any temporary data

      return { message: 'Payment cancellation processed' };

    } catch (error) {
      console.error('Error handling payment cancellation:', error);
      return { message: 'Error processing payment cancellation' };
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(event: WebhookEvent): Promise<{ message: string }> {
    try {
      console.log('Payment failed:', {
        userId: event.userId,
        transactionId: event.transactionId,
      });

      // In a real application, you would:
      // 1. Log the failure
      // 2. Send notification to user
      // 3. Possibly retry payment or offer alternative

      return { message: 'Payment failure processed' };

    } catch (error) {
      console.error('Error handling payment failure:', error);
      return { message: 'Error processing payment failure' };
    }
  }

  /**
   * Map PayFast payment status to event type
   */
  private mapPaymentStatusToEventType(status: string): WebhookEvent['type'] {
    switch (status) {
      case 'COMPLETE':
        return 'payment_complete';
      case 'CANCELLED':
        return 'payment_cancelled';
      case 'FAILED':
        return 'payment_failed';
      default:
        return 'payment_failed';
    }
  }

  /**
   * Get subscription for user
   */
  getSubscription(userId: string): SubscriptionUpdate | null {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Get all subscriptions
   */
  getAllSubscriptions(): SubscriptionUpdate[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return { success: false, message: 'Subscription not found' };
      }

      subscription.status = 'cancelled';
      this.subscriptions.set(userId, subscription);

      console.log('Subscription cancelled:', { userId });

      return { success: true, message: 'Subscription cancelled successfully' };

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, message: 'Error cancelling subscription' };
    }
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription(userId: string): boolean {
    const subscription = this.subscriptions.get(userId);
    return subscription ? subscription.status === 'active' : false;
  }

  /**
   * Get subscription status for user
   */
  getSubscriptionStatus(userId: string): {
    hasSubscription: boolean;
    status: string;
    planId: string;
    endDate: string;
    nextBillingDate: string;
  } {
    const subscription = this.subscriptions.get(userId);
    
    if (!subscription) {
      return {
        hasSubscription: false,
        status: 'none',
        planId: '',
        endDate: '',
        nextBillingDate: '',
      };
    }

    return {
      hasSubscription: true,
      status: subscription.status,
      planId: subscription.planId,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
    };
  }
}

// Export singleton instance
export default new WebhookHandler();
