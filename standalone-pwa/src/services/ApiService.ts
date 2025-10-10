// API Service for Live Production Data Integration
// Connects Customer Storefront to Business Dashboard

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  businessId: string;
  enableWebSocket: boolean;
  websocketUrl?: string;
}

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

export interface OrderUpdate {
  orderId: string;
  status: string;
  updatedAt: string;
  notes?: string;
}

class ApiService {
  private config: ApiConfig;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Array<(data: any) => void> = [];

  constructor(config: ApiConfig) {
    this.config = config;
    this.initializeWebSocket();
  }

  // Initialize WebSocket connection for real-time updates
  private initializeWebSocket() {
    if (!this.config.enableWebSocket || !this.config.websocketUrl) {
      console.log('WebSocket disabled or URL not provided');
      return;
    }

    try {
      this.websocket = new WebSocket(this.config.websocketUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication
        this.websocket?.send(JSON.stringify({
          type: 'auth',
          businessId: this.config.businessId,
          apiKey: this.config.apiKey
        }));
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'new_order':
        this.notifyListeners({ type: 'new_order', data: data.order });
        break;
      case 'order_update':
        this.notifyListeners({ type: 'order_update', data: data.order });
        break;
      case 'order_status_change':
        this.notifyListeners({ type: 'order_status_change', data: data.update });
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  // Attempt to reconnect WebSocket
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Subscribe to real-time updates
  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data));
  }

  // Fetch orders from API
  async fetchOrders(): Promise<LiveOrderData[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Send WebSocket update if connected
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'order_status_update',
          orderId,
          status,
          notes,
          updatedAt: new Date().toISOString()
        }));
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Send WhatsApp message
  async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          message,
          businessId: this.config.businessId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Get business statistics
  async getBusinessStats(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/business/stats`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching business stats:', error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Close WebSocket connection
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Production configuration
export const productionConfig: ApiConfig = {
  baseUrl: 'https://api.Thenga.com',
  apiKey: '',
  businessId: 'store_123',
  enableWebSocket: true,
  websocketUrl: 'wss://api.Thenga.com/ws'
};

// Development configuration
export const developmentConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001',
  apiKey: 'dev-api-key-123',
  businessId: 'store_123',
  enableWebSocket: true,
  websocketUrl: 'ws://localhost:3001/ws'
};

// Create API service instance
const isDevelopment = window.location.hostname === 'localhost';
export const apiService = new ApiService(isDevelopment ? developmentConfig : productionConfig);

export default apiService;
