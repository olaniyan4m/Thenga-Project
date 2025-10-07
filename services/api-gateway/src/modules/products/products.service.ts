import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async getProducts(merchantId: string) {
    // Mock products data - in real app, query database
    const mockProducts = [
      {
        id: '1',
        merchantId: merchantId,
        sku: 'COFFEE-001',
        name: 'Cappuccino',
        description: 'Rich espresso with steamed milk',
        price: 2500, // in cents
        stock: 50,
        imageUrl: ['https://example.com/cappuccino.jpg'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        merchantId: merchantId,
        sku: 'PASTRY-001',
        name: 'Croissant',
        description: 'Buttery French pastry',
        price: 1500, // in cents
        stock: 30,
        imageUrl: ['https://example.com/croissant.jpg'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockProducts;
  }

  async createProduct(createProductDto: any) {
    // In real app, save to database
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...createProductDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateProduct(id: string, updateProductDto: any) {
    // In real app, update database
    return {
      id,
      ...updateProductDto,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteProduct(id: string) {
    // In real app, delete from database
    return { message: 'Product deleted successfully' };
  }
}
