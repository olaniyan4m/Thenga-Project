import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MerchantsService {
  async getProfile(userId: string) {
    // Mock merchant data - in real app, query database
    const mockMerchant = {
      id: userId,
      userId: userId,
      businessName: 'Demo Coffee Shop',
      address: '123 Main Street, Cape Town, South Africa',
      bankDetails: {
        bankName: 'Standard Bank',
        accountHolder: 'Demo Coffee Shop',
        accountNumber: '1234567890',
        branchCode: '051001',
        accountType: 'Business',
      },
      settings: {
        currency: 'ZAR',
        paymentOptions: ['card', 'eft', 'cash', 'qr'],
        whatsappAutomationEnabled: true,
        smsFallbackEnabled: true,
        branding: {
          logoUrl: 'https://example.com/logo.png',
          primaryColor: '#2E7D32',
        },
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockMerchant;
  }

  async updateProfile(userId: string, updateData: any) {
    // In real app, update database
    return {
      ...updateData,
      id: userId,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSettings(userId: string) {
    // Mock settings - in real app, query database
    return {
      currency: 'ZAR',
      paymentOptions: ['card', 'eft', 'cash', 'qr'],
      whatsappAutomationEnabled: true,
      smsFallbackEnabled: true,
      branding: {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#2E7D32',
      },
    };
  }

  async updateSettings(userId: string, settings: any) {
    // In real app, update database
    return {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
  }
}
