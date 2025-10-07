import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  async getOrders(merchantId: string) {
    // Mock orders data - in real app, query database
    const mockOrders = [
      {
        id: '1',
        merchantId: merchantId,
        customerDetails: {
          name: 'John Smith',
          phone: '+27821234567',
          email: 'john@example.com',
          address: '123 Main St, Cape Town',
        },
        items: [
          {
            productId: '1',
            sku: 'COFFEE-001',
            name: 'Cappuccino',
            quantity: 2,
            unitPrice: 2500,
            totalPrice: 5000,
          },
        ],
        totalAmount: 5000,
        currency: 'ZAR',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockOrders;
  }

  async createOrder(createOrderDto: any) {
    // In real app, save to database
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...createOrderDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateOrderStatus(id: string, statusUpdate: any) {
    // In real app, update database
    return {
      id,
      ...statusUpdate,
      updatedAt: new Date().toISOString(),
    };
  }
}
