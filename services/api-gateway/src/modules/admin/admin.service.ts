import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getDashboard() {
    // Mock admin dashboard data - in real app, query database
    return {
      totalUsers: 150,
      totalMerchants: 45,
      totalOrders: 1250,
      totalRevenue: 125000,
      recentActivity: [
        {
          id: '1',
          type: 'user_registration',
          message: 'New merchant registered',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  async getUsers() {
    // Mock users data - in real app, query database
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'merchant',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
