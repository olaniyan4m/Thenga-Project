// WhatsApp Message Service - Connects Customer and Business

export interface WhatsAppMessage {
  id: string;
  from: 'customer' | 'business';
  customerName?: string;
  customerPhone?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

class WhatsAppService {
  private messages: WhatsAppMessage[] = [];
  private businessListeners: Array<(messages: WhatsAppMessage[]) => void> = [];
  private customerListeners: Array<(messages: WhatsAppMessage[]) => void> = [];

  constructor() {
    this.loadMessages();
  }

  private loadMessages() {
    const saved = localStorage.getItem('whatsapp_messages');
    if (saved) {
      this.messages = JSON.parse(saved);
    } else {
      // Initialize with sample messages
      this.messages = [
        {
          id: '1',
          from: 'customer',
          customerName: 'John Smith',
          customerPhone: '+27821234567',
          message: 'Hi! I placed an order for 2 Classic Kotas. When will it be ready?',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          from: 'business',
          message: 'Hello John! Thank you for your order. Your 2 Classic Kotas will be ready in 15 minutes. We\'ll notify you when it\'s ready for pickup.',
          timestamp: new Date().toISOString(),
          read: true
        }
      ];
      this.saveMessages();
    }
  }

  private saveMessages() {
    localStorage.setItem('whatsapp_messages', JSON.stringify(this.messages));
    this.notifyBusinessListeners();
    this.notifyCustomerListeners();
  }

  private notifyBusinessListeners() {
    this.businessListeners.forEach(listener => listener([...this.messages]));
  }

  private notifyCustomerListeners() {
    this.customerListeners.forEach(listener => listener([...this.messages]));
  }

  // Subscribe to business messages
  subscribeBusiness(listener: (messages: WhatsAppMessage[]) => void) {
    this.businessListeners.push(listener);
    listener([...this.messages]);
    
    return () => {
      this.businessListeners = this.businessListeners.filter(l => l !== listener);
    };
  }

  // Subscribe to customer messages
  subscribeCustomer(customerPhone: string, listener: (messages: WhatsAppMessage[]) => void) {
    this.customerListeners.push(listener);
    const customerMessages = this.messages.filter(msg => 
      msg.customerPhone === customerPhone || msg.from === 'business'
    );
    listener(customerMessages);
    
    return () => {
      this.customerListeners = this.customerListeners.filter(l => l !== listener);
    };
  }

  // Send message from customer to business
  sendCustomerMessage(customerName: string, customerPhone: string, message: string) {
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      from: 'customer',
      customerName,
      customerPhone,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.messages.push(newMessage);
    this.saveMessages();
    
    return newMessage;
  }

  // Send message from business to customer
  sendBusinessMessage(customerPhone: string, message: string) {
    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      from: 'business',
      message,
      timestamp: new Date().toISOString(),
      read: true
    };

    this.messages.push(newMessage);
    this.saveMessages();
    
    return newMessage;
  }

  // Mark messages as read
  markAsRead(messageId: string) {
    this.messages = this.messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    this.saveMessages();
  }

  // Get unread count for business
  getUnreadCount(): number {
    return this.messages.filter(msg => msg.from === 'customer' && !msg.read).length;
  }

  // Get messages for specific customer
  getCustomerMessages(customerPhone: string): WhatsAppMessage[] {
    return this.messages.filter(msg => 
      msg.customerPhone === customerPhone || msg.from === 'business'
    );
  }

  // Get all business messages
  getBusinessMessages(): WhatsAppMessage[] {
    return [...this.messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}

// Export singleton instance
export const whatsAppService = new WhatsAppService();
