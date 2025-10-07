// 💳 Payment Service - Links Customer Payments to Business Accounts
// Handles payment processing and business account integration

import { firebaseService } from './FirebaseService';
import PayFastService from './PayFastService';
import { apiService } from './ApiService';

export interface LiveOrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    image?: string;
    color?: string;
    variant?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'cash' | 'eft';
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  businessId: string;
  source: 'customer_storefront' | 'admin_panel' | 'api';
}

export interface CustomerPayment {
  id: string;
  businessId: string;
  customerId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'cash' | 'eft';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  gatewayProvider: 'payfast' | 'yoco' | 'snapscan' | 'zapper';
  gatewayTransactionId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPayment {
  id: string;
  businessId: string;
  totalAmount: number;
  netAmount: number; // Amount after fees
  fees: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

class PaymentService {
  private isLiveMode: boolean = false;
  private apiSubscription: (() => void) | null = null;

  constructor() {
    this.initializeLiveMode();
  }

  // Initialize live mode for production
  private async initializeLiveMode() {
    try {
      // Check if we're in production mode
      const isProduction = process.env.NODE_ENV === 'production' || 
                           window.location.hostname !== 'localhost';
      
      if (isProduction) {
        this.isLiveMode = true;
        console.log('PaymentService: Initializing live mode for production');
        
        // Subscribe to real-time updates
        this.apiSubscription = apiService.subscribe((data) => {
          this.handleLiveUpdate(data);
        });
      }
    } catch (error) {
      console.error('Failed to initialize PaymentService live mode:', error);
    }
  }

  // Handle live updates from API
  private handleLiveUpdate(data: any) {
    switch (data.type) {
      case 'new_payment':
        this.handleNewPayment(data.data);
        break;
      case 'payment_update':
        this.handlePaymentUpdate(data.data);
        break;
      case 'payment_status_change':
        this.handlePaymentStatusChange(data.data);
        break;
    }
  }

  // Handle new payment from live data
  private handleNewPayment(paymentData: any) {
    console.log('New payment received:', paymentData);
    // Notify listeners or update local state
  }

  // Handle payment update
  private handlePaymentUpdate(paymentData: any) {
    console.log('Payment updated:', paymentData);
    // Update local payment data
  }

  // Handle payment status change
  private handlePaymentStatusChange(update: any) {
    console.log('Payment status changed:', update);
    // Update payment status
  }

  // Process customer payment and link to business account
  async processCustomerPayment(paymentData: {
    businessId: string;
    customerId: string;
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: 'card' | 'cash' | 'eft';
  }): Promise<{
    success: boolean;
    paymentId?: string;
    error?: string;
  }> {
    try {
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create customer payment record
      const customerPayment: CustomerPayment = {
        id: paymentId,
        businessId: paymentData.businessId,
        customerId: paymentData.customerId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: 'ZAR',
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: 'pending',
        gatewayProvider: 'payfast', // Default to PayFast for SA
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save customer payment to Firebase
      await this.saveCustomerPayment(customerPayment);

      // Process payment through gateway
      if (paymentData.paymentMethod === 'card') {
        const gatewayResult = await this.processCardPayment(customerPayment);
        if (gatewayResult.success) {
          customerPayment.paymentStatus = 'paid';
          customerPayment.gatewayTransactionId = gatewayResult.transactionId;
        } else {
          customerPayment.paymentStatus = 'failed';
        }
        
        // Update payment status
        await this.updatePaymentStatus(paymentId, customerPayment.paymentStatus);
      }

      // Send to API if in live mode
      if (this.isLiveMode) {
        try {
          await this.sendPaymentToAPI(customerPayment);
        } catch (error) {
          console.error('Failed to send payment to API:', error);
          // Continue with local processing even if API fails
        }
      } else {
        // Cash payments are marked as pending until confirmed by business
        customerPayment.paymentStatus = 'pending';
      }

      // Create business payment record
      await this.createBusinessPayment({
        businessId: paymentData.businessId,
        amount: paymentData.amount,
        customerPaymentId: paymentId
      });

      return {
        success: true,
        paymentId: paymentId
      };

    } catch (error) {
      console.error('Error processing customer payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Process card payment through PayFast
  private async processCardPayment(customerPayment: CustomerPayment): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const result = await PayFastService.createPayment({
        firstName: customerPayment.customerName.split(' ')[0],
        lastName: customerPayment.customerName.split(' ').slice(1).join(' '),
        email: customerPayment.customerEmail,
        amount: customerPayment.amount,
        itemName: `Order #${customerPayment.orderId}`,
        itemDescription: `Payment for order ${customerPayment.orderId}`,
        merchantOrderId: customerPayment.orderId
      });

      if (result.success && result.paymentUrl) {
        // In a real app, redirect to PayFast
        // For demo, simulate successful payment
        return {
          success: true,
          transactionId: `pf_${Date.now()}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Payment gateway error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment gateway error'
      };
    }
  }

  // Save customer payment to Firebase
  private async saveCustomerPayment(payment: CustomerPayment): Promise<void> {
    try {
      await firebaseService.saveCustomerPayment({
        id: payment.id,
        name: payment.customerName,
        email: payment.customerEmail,
        phone: payment.customerPhone,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      });
      
      // Save payment record to Firebase
      // In a real app, this would be: await setDoc(doc(db, 'payments', payment.id), payment);
      console.log('Customer payment saved to Firebase:', payment);
    } catch (error) {
      console.error('Error saving customer payment:', error);
      throw error;
    }
  }

  // Create business payment record
  private async createBusinessPayment(data: {
    businessId: string;
    amount: number;
    customerPaymentId: string;
  }): Promise<void> {
    try {
      const businessPayment: BusinessPayment = {
        id: `biz_pay_${Date.now()}`,
        businessId: data.businessId,
        totalAmount: data.amount,
        netAmount: data.amount * 0.97, // 3% fee deduction
        fees: data.amount * 0.03,
        currency: 'ZAR',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save business payment to Firebase
      // In a real app, this would be: await setDoc(doc(db, 'business_payments', businessPayment.id), businessPayment);
      console.log('Business payment created:', businessPayment);
    } catch (error) {
      console.error('Error creating business payment:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: CustomerPayment['paymentStatus']): Promise<void> {
    try {
      // Update payment status in Firebase
      // In a real app, this would be: await updateDoc(doc(db, 'payments', paymentId), { paymentStatus: status });
      console.log(`Payment ${paymentId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get business payments
  async getBusinessPayments(businessId: string): Promise<BusinessPayment[]> {
    try {
      // In a real app, this would query Firebase for business payments
      // For demo, return mock data
      return [
        {
          id: 'biz_pay_1',
          businessId: businessId,
          totalAmount: 150.00,
          netAmount: 145.50,
          fees: 4.50,
          currency: 'ZAR',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error getting business payments:', error);
      return [];
    }
  }

  // Get customer payments
  async getCustomerPayments(customerId: string): Promise<CustomerPayment[]> {
    try {
      // In a real app, this would query Firebase for customer payments
      // For demo, return mock data
      return [
        {
          id: 'pay_1',
          businessId: 'store_123',
          customerId: customerId,
          orderId: 'ORD-001',
          amount: 150.00,
          currency: 'ZAR',
          paymentMethod: 'card',
          paymentStatus: 'paid',
          gatewayProvider: 'payfast',
          gatewayTransactionId: 'pf_123456',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          customerPhone: '+27821234567',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error getting customer payments:', error);
      return [];
    }
  }

  // Calculate business earnings
  async calculateBusinessEarnings(businessId: string): Promise<{
    totalRevenue: number;
    netEarnings: number;
    totalFees: number;
    pendingPayments: number;
  }> {
    try {
      const payments = await this.getBusinessPayments(businessId);
      
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
      const netEarnings = payments.reduce((sum, payment) => sum + payment.netAmount, 0);
      const totalFees = payments.reduce((sum, payment) => sum + payment.fees, 0);
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      return {
        totalRevenue,
        netEarnings,
        totalFees,
        pendingPayments
      };
    } catch (error) {
      console.error('Error calculating business earnings:', error);
      return {
        totalRevenue: 0,
        netEarnings: 0,
        totalFees: 0,
        pendingPayments: 0
      };
    }
  }

  // Send payment to API
  private async sendPaymentToAPI(payment: CustomerPayment) {
    try {
      const response = await fetch(`${apiService['config'].baseUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService['config'].apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: payment.id,
          businessId: payment.businessId,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          gatewayProvider: payment.gatewayProvider,
          gatewayTransactionId: payment.gatewayTransactionId,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          customerPhone: payment.customerPhone,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Payment sent to API successfully');
    } catch (error) {
      console.error('Error sending payment to API:', error);
      throw error;
    }
  }

  // Get business payment statistics
  async getBusinessPaymentStats() {
    if (this.isLiveMode) {
      try {
        return await apiService.getBusinessStats();
      } catch (error) {
        console.error('Failed to fetch payment stats from API:', error);
        // Fallback to local stats
      }
    }

    // Local fallback stats
    return {
      totalPayments: 0,
      totalAmount: 0,
      completedPayments: 0,
      pendingPayments: 0,
      failedPayments: 0
    };
  }

  // Cleanup method
  destroy() {
    if (this.apiSubscription) {
      this.apiSubscription();
      this.apiSubscription = null;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
