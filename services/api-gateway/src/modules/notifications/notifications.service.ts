import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getNotifications(userId: string) {
    // Mock notifications data - in real app, query database
    const mockNotifications = [
      {
        id: '1',
        targetUserId: userId,
        merchantId: '1',
        channel: 'whatsapp',
        type: 'order_confirmation',
        payload: {
          message: 'Your order has been confirmed!',
          orderNumber: 'ORD-001',
        },
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    ];

    return mockNotifications;
  }

  async sendNotification(notificationDto: any) {
    // In real app, integrate with WhatsApp, SMS, Email services
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...notificationDto,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
  }
}
