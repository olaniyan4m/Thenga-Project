// Order Management Service - Connects Customer Storefront to Business Dashboard
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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string;
  color?: string;
  variant?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
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
}

class OrderService {
  private orders: CustomerOrder[] = [];
  private listeners: Array<(orders: CustomerOrder[]) => void> = [];
  private isLiveMode: boolean = false;
  private apiSubscription: (() => void) | null = null;

  // Initialize with sample orders
  constructor() {
    this.loadOrders();
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
        console.log('Initializing live mode for production');
        
        // Subscribe to real-time updates
        this.apiSubscription = apiService.subscribe((data) => {
          this.handleLiveUpdate(data);
        });

        // Fetch initial orders from API
        await this.syncWithAPI();
      }
    } catch (error) {
      console.error('Failed to initialize live mode:', error);
    }
  }

  // Handle live updates from API
  private handleLiveUpdate(data: any) {
    switch (data.type) {
      case 'new_order':
        this.addLiveOrder(data.data);
        break;
      case 'order_update':
        this.updateLiveOrder(data.data);
        break;
      case 'order_status_change':
        this.updateOrderStatusFromAPI(data.data);
        break;
    }
  }

  // Add new order from live data
  private addLiveOrder(liveOrder: LiveOrderData) {
    const order: CustomerOrder = {
      id: liveOrder.id,
      orderNumber: liveOrder.orderNumber,
      customerName: liveOrder.customerName,
      customerEmail: liveOrder.customerEmail,
      customerPhone: liveOrder.customerPhone,
      customerAddress: liveOrder.customerAddress,
      items: liveOrder.items,
      subtotal: liveOrder.subtotal,
      deliveryFee: liveOrder.deliveryFee,
      tax: liveOrder.tax,
      totalAmount: liveOrder.totalAmount,
      status: liveOrder.status,
      paymentMethod: liveOrder.paymentMethod,
      paymentStatus: liveOrder.paymentStatus,
      notes: liveOrder.notes,
      createdAt: liveOrder.createdAt,
      updatedAt: liveOrder.updatedAt,
      businessId: liveOrder.businessId
    };

    // Add to local orders if not already present
    const existingOrder = this.orders.find(o => o.id === order.id);
    if (!existingOrder) {
      this.orders.unshift(order); // Add to beginning
      this.saveOrders();
      this.showBusinessNotification(order);
    }
  }

  // Update existing order from live data
  private updateLiveOrder(liveOrder: LiveOrderData) {
    const index = this.orders.findIndex(o => o.id === liveOrder.id);
    if (index !== -1) {
      this.orders[index] = {
        ...this.orders[index],
        ...liveOrder,
        updatedAt: liveOrder.updatedAt
      };
      this.saveOrders();
    }
  }

  // Update order status from API
  private updateOrderStatusFromAPI(update: any) {
    const order = this.orders.find(o => o.id === update.orderId);
    if (order) {
      order.status = update.status;
      order.updatedAt = update.updatedAt;
      if (update.notes) {
        order.notes = update.notes;
      }
      this.saveOrders();
    }
  }

  // Sync with API
  private async syncWithAPI() {
    try {
      const liveOrders = await apiService.fetchOrders();
      const convertedOrders = liveOrders.map(this.convertLiveOrderToCustomerOrder);
      
      // Merge with existing orders, avoiding duplicates
      const existingIds = new Set(this.orders.map(o => o.id));
      const newOrders = convertedOrders.filter(o => !existingIds.has(o.id));
      
      this.orders = [...newOrders, ...this.orders];
      this.saveOrders();
    } catch (error) {
      console.error('Failed to sync with API:', error);
    }
  }

  // Convert live order to customer order format
  private convertLiveOrderToCustomerOrder = (liveOrder: LiveOrderData): CustomerOrder => {
    return {
      id: liveOrder.id,
      orderNumber: liveOrder.orderNumber,
      customerName: liveOrder.customerName,
      customerEmail: liveOrder.customerEmail,
      customerPhone: liveOrder.customerPhone,
      customerAddress: liveOrder.customerAddress,
      items: liveOrder.items,
      subtotal: liveOrder.subtotal,
      deliveryFee: liveOrder.deliveryFee,
      tax: liveOrder.tax,
      totalAmount: liveOrder.totalAmount,
      status: liveOrder.status,
      paymentMethod: liveOrder.paymentMethod,
      paymentStatus: liveOrder.paymentStatus,
      notes: liveOrder.notes,
      createdAt: liveOrder.createdAt,
      updatedAt: liveOrder.updatedAt,
      businessId: liveOrder.businessId
    };
  }

  // Load orders from localStorage
  private loadOrders() {
    const saved = localStorage.getItem('customer_orders');
    if (saved) {
      this.orders = JSON.parse(saved);
    } else {
      // Initialize with sample orders
      this.orders = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          customerPhone: '+27821234567',
          customerAddress: '123 Main St, Johannesburg',
          items: [
            { 
              productId: '1', 
              name: 'Classic Kota', 
              quantity: 2, 
              price: 35, 
              totalPrice: 70,
              image: 'https://via.placeholder.com/60x60/8B4513/fff?text=🍔',
              color: 'Brown'
            }
          ],
          subtotal: 85,
          deliveryFee: 25,
          tax: 13.5,
          totalAmount: 123.5,
          status: 'pending',
          paymentMethod: 'card',
          paymentStatus: 'paid',
          notes: 'Extra spicy please',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessId: 'store_123'
        }
      ];
      this.saveOrders();
    }
  }

  // Save orders to localStorage
  private saveOrders() {
    localStorage.setItem('customer_orders', JSON.stringify(this.orders));
    this.notifyListeners();
  }

  // Notify all listeners of order changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.orders]));
  }

  // Subscribe to order changes
  subscribe(listener: (orders: CustomerOrder[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current orders
    listener([...this.orders]);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Create new order from customer
  createOrder(orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): CustomerOrder {
    const order: CustomerOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(order); // Add to beginning
    this.saveOrders();
    
    // Show notification to business
    this.showBusinessNotification(order);
    
    return order;
  }

  // Update order status (business dashboard)
  async updateOrderStatus(orderId: string, status: CustomerOrder['status'], notes?: string): Promise<void> {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      if (notes) order.notes = notes;
      
      // Update via API if in live mode
      if (this.isLiveMode) {
        try {
          await apiService.updateOrderStatus(orderId, status, notes);
        } catch (error) {
          console.error('Failed to update order status via API:', error);
          // Still update locally even if API fails
        }
      }
      
      this.saveOrders();
      
      // Notify customer if status changed
      this.notifyCustomer(order);
    }
  }

  // Get orders for business dashboard
  getBusinessOrders(): CustomerOrder[] {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get orders for customer
  getCustomerOrders(customerPhone: string): CustomerOrder[] {
    return this.orders
      .filter(order => order.customerPhone === customerPhone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Show notification to business
  private showBusinessNotification(order: CustomerOrder) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Order Received!', {
        body: `Order #${order.orderNumber} from ${order.customerName} - R${order.totalAmount.toFixed(2)}`,
        icon: '/assets/Kota_logo.png'
      });
    }
  }

  // Notify customer about order status
  private notifyCustomer(order: CustomerOrder) {
    const statusMessages = {
      'confirmed': `Your order #${order.orderNumber} has been confirmed! We're preparing it now.`,
      'preparing': `Your order #${order.orderNumber} is being prepared. It will be ready soon!`,
      'ready': `Your order #${order.orderNumber} is ready for pickup! Please come collect it.`,
      'delivered': `Your order #${order.orderNumber} has been delivered. Thank you!`,
      'cancelled': `Your order #${order.orderNumber} has been cancelled. We'll contact you shortly.`
    };

    const message = statusMessages[order.status];
    if (message) {
      // In a real app, this would send via WhatsApp Business API
      console.log(`WhatsApp to ${order.customerPhone}: ${message}`);
      
      // For demo, show alert
      setTimeout(() => {
        alert(`WhatsApp sent to ${order.customerPhone}:\n${message}`);
      }, 1000);
    }
  }

  // Send WhatsApp message to customer
  async sendWhatsAppMessage(order: CustomerOrder, customMessage?: string): Promise<void> {
    const message = customMessage || `Hello ${order.customerName}, regarding your order #${order.orderNumber}. How can we help you?`;
    
    if (this.isLiveMode) {
      try {
        await apiService.sendWhatsAppMessage(order.customerPhone, message);
        console.log(`WhatsApp sent via API to ${order.customerPhone}: ${message}`);
      } catch (error) {
        console.error('Failed to send WhatsApp via API:', error);
        // Fallback to demo mode
        this.sendWhatsAppDemo(order, message);
      }
    } else {
      this.sendWhatsAppDemo(order, message);
    }
  }

  // Demo WhatsApp sending
  private sendWhatsAppDemo(order: CustomerOrder, message: string) {
    console.log(`WhatsApp to ${order.customerPhone}: ${message}`);
    alert(`WhatsApp sent to ${order.customerPhone}:\n${message}`);
  }

  // Cleanup method
  destroy() {
    if (this.apiSubscription) {
      this.apiSubscription();
      this.apiSubscription = null;
    }
  }

  // Get order statistics
  getOrderStats() {
    const total = this.orders.length;
    const pending = this.orders.filter(o => o.status === 'pending').length;
    const completed = this.orders.filter(o => o.status === 'delivered').length;
    const revenue = this.orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      total,
      pending,
      completed,
      revenue
    };
  }
}

// Export singleton instance
export const orderService = new OrderService();
