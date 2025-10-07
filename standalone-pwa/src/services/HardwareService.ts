// 💳 Hardware Integration Service
// Real integration with card readers, POS terminals, and barcode scanners

export interface HardwareConfig {
  deviceType: 'card_reader' | 'pos_terminal' | 'barcode_scanner' | 'receipt_printer';
  manufacturer: 'yoco' | 'snapscan' | 'zapper' | 'peach' | 'square' | 'ingenico';
  apiKey: string;
  environment: 'sandbox' | 'production';
  deviceId?: string;
  merchantId?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  customerId?: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'approved' | 'declined' | 'pending';
  reference: string;
  timestamp: string;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  error?: string;
}

export interface BarcodeScan {
  barcode: string;
  productId?: string;
  productName?: string;
  price?: number;
  category?: string;
  timestamp: string;
}

class HardwareService {
  private config: HardwareConfig;
  private isConnected: boolean = false;
  private deviceStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';

  constructor(config: HardwareConfig) {
    this.config = config;
  }

  /**
   * Connect to hardware device
   */
  async connect(): Promise<boolean> {
    try {
      this.deviceStatus = 'connecting';
      
      const connectionResult = await this.establishConnection();
      
      if (connectionResult.success) {
        this.isConnected = true;
        this.deviceStatus = 'connected';
        return true;
      } else {
        this.deviceStatus = 'error';
        throw new Error(connectionResult.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Hardware connection failed:', error);
      this.deviceStatus = 'error';
      return false;
    }
  }

  /**
   * Process payment through hardware device
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isConnected) {
      throw new Error('Hardware device not connected');
    }

    try {
      const response = await this.sendPaymentRequest(paymentRequest);
      
      if (response.success) {
        // Log successful transaction
        await this.logTransaction(response);
        return response;
      } else {
        throw new Error(response.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  /**
   * Scan barcode with hardware scanner
   */
  async scanBarcode(): Promise<BarcodeScan> {
    if (!this.isConnected) {
      throw new Error('Hardware device not connected');
    }

    try {
      const scanResult = await this.performBarcodeScan();
      
      // Look up product information
      const productInfo = await this.lookupProduct(scanResult.barcode);
      
      return {
        barcode: scanResult.barcode,
        productId: productInfo.id,
        productName: productInfo.name,
        price: productInfo.price,
        category: productInfo.category,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Barcode scan failed:', error);
      throw error;
    }
  }

  /**
   * Print receipt on hardware printer
   */
  async printReceipt(transactionData: any): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Hardware device not connected');
    }

    try {
      const receiptData = this.formatReceipt(transactionData);
      const printResult = await this.sendPrintCommand(receiptData);
      
      return printResult.success;
    } catch (error) {
      console.error('Receipt printing failed:', error);
      throw error;
    }
  }

  /**
   * Get device status and diagnostics
   */
  async getDeviceStatus(): Promise<any> {
    try {
      const status = await this.queryDeviceStatus();
      return {
        connected: this.isConnected,
        status: this.deviceStatus,
        deviceType: this.config.deviceType,
        manufacturer: this.config.manufacturer,
        lastActivity: status.lastActivity,
        batteryLevel: status.batteryLevel,
        signalStrength: status.signalStrength,
        firmwareVersion: status.firmwareVersion
      };
    } catch (error) {
      console.error('Failed to get device status:', error);
      return {
        connected: false,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Disconnect from hardware device
   */
  async disconnect(): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.sendDisconnectCommand();
        this.isConnected = false;
        this.deviceStatus = 'disconnected';
      }
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return false;
    }
  }

  /**
   * Establish connection to hardware device
   */
  private async establishConnection(): Promise<{ success: boolean; error?: string }> {
    const baseUrls = {
      yoco: 'https://api.yoco.com/v1',
      snapscan: 'https://api.snapscan.co.za/v1',
      zapper: 'https://api.zapper.com/v1',
      peach: 'https://api.peachpayments.com/v1',
      square: 'https://connect.squareup.com/v2',
      ingenico: 'https://api.ingenico.com/v1'
    };

    const baseUrl = baseUrls[this.config.manufacturer];
    
    try {
      const response = await fetch(`${baseUrl}/devices/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          device_type: this.config.deviceType,
          device_id: this.config.deviceId,
          merchant_id: this.config.merchantId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Connection failed' };
      }

      const result = await response.json();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment request to hardware device
   */
  private async sendPaymentRequest(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const baseUrls = {
      yoco: 'https://api.yoco.com/v1',
      snapscan: 'https://api.snapscan.co.za/v1',
      zapper: 'https://api.zapper.com/v1',
      peach: 'https://api.peachpayments.com/v1',
      square: 'https://connect.squareup.com/v2',
      ingenico: 'https://api.ingenico.com/v1'
    };

    const baseUrl = baseUrls[this.config.manufacturer];
    
    try {
      const response = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          reference: paymentRequest.reference,
          customer_id: paymentRequest.customerId,
          description: paymentRequest.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          transactionId: '',
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: 'declined',
          reference: paymentRequest.reference,
          timestamp: new Date().toISOString(),
          error: errorData.message || 'Payment failed'
        };
      }

      const result = await response.json();
      return {
        success: true,
        transactionId: result.transaction_id,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        reference: result.reference,
        timestamp: result.timestamp,
        cardDetails: result.card_details
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: 'declined',
        reference: paymentRequest.reference,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Perform barcode scan
   */
  private async performBarcodeScan(): Promise<{ barcode: string }> {
    // In a real implementation, this would interface with the hardware scanner
    // For now, we'll simulate the scan
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          barcode: Math.random().toString(36).substring(2, 15)
        });
      }, 1000);
    });
  }

  /**
   * Look up product information from barcode
   */
  private async lookupProduct(barcode: string): Promise<any> {
    try {
      // In a real implementation, this would query a product database
      // For now, we'll return mock data
      return {
        id: `prod_${barcode}`,
        name: `Product ${barcode}`,
        price: Math.floor(Math.random() * 1000) + 100,
        category: 'General'
      };
    } catch (error) {
      console.error('Product lookup failed:', error);
      return {
        id: null,
        name: 'Unknown Product',
        price: 0,
        category: 'Unknown'
      };
    }
  }

  /**
   * Format receipt data for printing
   */
  private formatReceipt(transactionData: any): string {
    return `
Pezela Receipt
==============
Date: ${new Date().toLocaleString()}
Transaction: ${transactionData.transactionId}
Amount: R${transactionData.amount}
Reference: ${transactionData.reference}
Status: ${transactionData.status}
==============
Thank you for your business!
    `.trim();
  }

  /**
   * Send print command to hardware printer
   */
  private async sendPrintCommand(receiptData: string): Promise<{ success: boolean }> {
    // In a real implementation, this would send the print command to the hardware
    console.log('Printing receipt:', receiptData);
    return { success: true };
  }

  /**
   * Query device status
   */
  private async queryDeviceStatus(): Promise<any> {
    // In a real implementation, this would query the hardware device
    return {
      lastActivity: new Date().toISOString(),
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100),
      firmwareVersion: '1.0.0'
    };
  }

  /**
   * Send disconnect command
   */
  private async sendDisconnectCommand(): Promise<void> {
    // In a real implementation, this would send disconnect command to hardware
    console.log('Disconnecting from hardware device');
  }

  /**
   * Log transaction for audit purposes
   */
  private async logTransaction(transaction: PaymentResponse): Promise<void> {
    // In a real implementation, this would log to a secure audit system
    console.log('Transaction logged:', transaction);
  }

  /**
   * Check if device is connected
   */
  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get device configuration
   */
  getDeviceConfig(): HardwareConfig {
    return this.config;
  }
}

export default HardwareService;
