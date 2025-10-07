// Mock API for development and testing
// This simulates the backend API responses

export const mockApi = {
  // Mock user data
  user: {
    id: '1',
    name: 'John Doe',
    phone: '+27821234567',
    email: 'john@example.com',
    role: 'merchant',
    kycStatus: 'verified',
    merchant: {
      id: '1',
      businessName: 'John\'s Coffee Shop',
      isVerified: true,
    },
  },

  // Mock dashboard stats
  dashboard: {
    totalOrders: 156,
    totalRevenue: 12500.50,
    pendingOrders: 8,
    completedOrders: 148,
  },

  // Mock products
  products: [
    {
      id: '1',
      name: 'Coffee',
      description: 'Freshly brewed coffee',
      price: 25.00,
      stock: 50,
      images: ['/images/coffee.jpg'],
      category: 'Beverages',
      isActive: true,
    },
    {
      id: '2',
      name: 'Sandwich',
      description: 'Chicken and mayo sandwich',
      price: 45.00,
      stock: 20,
      images: ['/images/sandwich.jpg'],
      category: 'Food',
      isActive: true,
    },
    {
      id: '3',
      name: 'Tea',
      description: 'Hot tea with milk',
      price: 18.00,
      stock: 30,
      images: ['/images/tea.jpg'],
      category: 'Beverages',
      isActive: true,
    },
  ],

  // Mock orders
  orders: [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Smith',
      customerPhone: '+27821234567',
      totalAmount: 150.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      items: [
        { name: 'Coffee', quantity: 2, price: 25.00 },
        { name: 'Sandwich', quantity: 1, price: 45.00 },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerPhone: '+27829876543',
      totalAmount: 85.50,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Tea', quantity: 1, price: 18.00 },
        { name: 'Muffin', quantity: 2, price: 15.00 },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Wilson',
      customerPhone: '+27825551234',
      totalAmount: 200.00,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Lunch Special', quantity: 1, price: 120.00 },
        { name: 'Drink', quantity: 1, price: 25.00 },
      ],
    },
  ],

  // Mock payments
  payments: [
    {
      id: '1',
      orderId: 'ORD-001',
      amount: 150.00,
      currency: 'ZAR',
      method: 'card',
      provider: 'payfast',
      status: 'paid',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      customerName: 'John Smith',
    },
    {
      id: '2',
      orderId: 'ORD-002',
      amount: 85.50,
      currency: 'ZAR',
      method: 'qr',
      provider: 'snapscan',
      status: 'paid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      customerName: 'Sarah Johnson',
    },
    {
      id: '3',
      orderId: 'ORD-003',
      amount: 200.00,
      currency: 'ZAR',
      method: 'eft',
      provider: 'yoco',
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      customerName: 'Mike Wilson',
    },
  ],
};

// Mock API functions
export const mockApiCall = async (url: string, options?: RequestInit) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const path = url.replace('/api', '');
  
  switch (path) {
    case '/auth/profile':
      return {
        ok: true,
        json: async () => mockApi.user,
      };
    
    case '/auth/login':
      return {
        ok: true,
        json: async () => ({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: mockApi.user,
        }),
      };
    
    case '/auth/register':
      return {
        ok: true,
        json: async () => ({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: mockApi.user,
        }),
      };
    
    case '/dashboard':
      return {
        ok: true,
        json: async () => mockApi.dashboard,
      };
    
    case '/products':
      return {
        ok: true,
        json: async () => mockApi.products,
      };
    
    case '/orders':
      return {
        ok: true,
        json: async () => mockApi.orders,
      };
    
    case '/payments':
      return {
        ok: true,
        json: async () => mockApi.payments,
      };
    
    default:
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      };
  }
};

// Override fetch for development
if (import.meta.env.DEV) {
  const originalFetch = window.fetch;
  window.fetch = async (url: string | URL | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url.toString();
    
    if (urlString.startsWith('/api/')) {
      return mockApiCall(urlString, options);
    }
    
    return originalFetch(url, options);
  };
}
