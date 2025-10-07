import { PrismaClient, Product, StockMovement, StockMovementType, ProductStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export interface CreateProductInput {
  merchantId: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string[];
  category?: string;
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string[];
  category?: string;
  tags?: string[];
  status?: ProductStatus;
}

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
  createdBy?: string;
}

export class InventoryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new product
   */
  async createProduct(input: CreateProductInput): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: {
          merchantId: input.merchantId,
          sku: input.sku,
          name: input.name,
          description: input.description,
          price: input.price,
          cost: input.cost,
          stock: input.stock || 0,
          minStock: input.minStock || 0,
          maxStock: input.maxStock,
          imageUrl: input.imageUrl || [],
          category: input.category,
          tags: input.tags || [],
        },
      });

      logger.info(`Product created: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.prisma.product.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error getting product:', error);
      throw error;
    }
  }

  /**
   * Get products by merchant
   */
  async getProductsByMerchant(merchantId: string, page: number = 1, limit: number = 20): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: { merchantId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.product.count({
          where: { merchantId },
        }),
      ]);

      return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting products by merchant:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });

      logger.info(`Product updated: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      logger.info(`Product deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Update stock quantity
   */
  async updateStock(input: StockMovementInput): Promise<StockMovement> {
    try {
      // Start a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Get current product
        const product = await tx.product.findUnique({
          where: { id: input.productId },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        // Calculate new stock
        let newStock = product.stock;
        if (input.type === 'IN') {
          newStock += input.quantity;
        } else if (input.type === 'OUT') {
          newStock -= input.quantity;
        } else if (input.type === 'ADJUSTMENT') {
          newStock = input.quantity;
        }

        // Check if stock would go negative
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }

        // Update product stock
        const updatedProduct = await tx.product.update({
          where: { id: input.productId },
          data: { stock: newStock },
        });

        // Create stock movement record
        const stockMovement = await tx.stockMovement.create({
          data: {
            productId: input.productId,
            type: input.type,
            quantity: input.quantity,
            reason: input.reason,
            reference: input.reference,
            notes: input.notes,
            createdBy: input.createdBy,
          },
        });

        return { updatedProduct, stockMovement };
      });

      logger.info(`Stock updated for product ${input.productId}: ${input.type} ${input.quantity}`);
      return result.stockMovement;
    } catch (error) {
      logger.error('Error updating stock:', error);
      throw error;
    }
  }

  /**
   * Get stock movements for a product
   */
  async getStockMovements(productId: string, page: number = 1, limit: number = 20): Promise<{
    movements: StockMovement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [movements, total] = await Promise.all([
        this.prisma.stockMovement.findMany({
          where: { productId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.stockMovement.count({
          where: { productId },
        }),
      ]);

      return {
        movements,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting stock movements:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(merchantId: string): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: {
          merchantId,
          stock: {
            lte: this.prisma.product.fields.minStock,
          },
          status: 'ACTIVE',
        },
        orderBy: { stock: 'asc' },
      });
    } catch (error) {
      logger.error('Error getting low stock products:', error);
      throw error;
    }
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts(merchantId: string): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: {
          merchantId,
          stock: 0,
          status: 'ACTIVE',
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Error getting out of stock products:', error);
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(merchantId: string, query: string, page: number = 1, limit: number = 20): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: {
            merchantId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } },
            ],
          },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.product.count({
          where: {
            merchantId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { tags: { has: query } },
            ],
          },
        }),
      ]);

      return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(merchantId: string): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStock: number;
  }> {
    try {
      const [
        totalProducts,
        products,
        lowStockProducts,
        outOfStockProducts,
      ] = await Promise.all([
        this.prisma.product.count({
          where: { merchantId, status: 'ACTIVE' },
        }),
        this.prisma.product.findMany({
          where: { merchantId, status: 'ACTIVE' },
          select: { stock: true, price: true },
        }),
        this.prisma.product.count({
          where: {
            merchantId,
            stock: {
              lte: this.prisma.product.fields.minStock,
            },
            status: 'ACTIVE',
          },
        }),
        this.prisma.product.count({
          where: {
            merchantId,
            stock: 0,
            status: 'ACTIVE',
          },
        }),
      ]);

      const totalValue = products.reduce((sum, product) => sum + (product.stock * Number(product.price)), 0);
      const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

      return {
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts,
        outOfStockCount: outOfStockProducts,
        totalStock,
      };
    } catch (error) {
      logger.error('Error getting inventory summary:', error);
      throw error;
    }
  }
}
