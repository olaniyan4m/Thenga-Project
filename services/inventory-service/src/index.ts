import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ProductController } from './controllers/product.controller';
import { StockController } from './controllers/stock.controller';
import { CategoryController } from './controllers/category.controller';
import { SupplierController } from './controllers/supplier.controller';
import { PurchaseController } from './controllers/purchase.controller';
import { AlertController } from './controllers/alert.controller';
import { logger } from './utils/logger';
import { InventoryService } from './services/inventory.service';
import { StockAlertService } from './services/stock-alert.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Prisma
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const inventoryService = new InventoryService(prisma);
const stockAlertService = new StockAlertService(prisma);

// Initialize controllers
const productController = new ProductController(inventoryService);
const stockController = new StockController(inventoryService);
const categoryController = new CategoryController(prisma);
const supplierController = new SupplierController(prisma);
const purchaseController = new PurchaseController(prisma);
const alertController = new AlertController(stockAlertService);

// Routes
app.use('/products', productController.router);
app.use('/stock', stockController.router);
app.use('/categories', categoryController.router);
app.use('/suppliers', supplierController.router);
app.use('/purchases', purchaseController.router);
app.use('/alerts', alertController.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'inventory-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down inventory service...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down inventory service...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Inventory Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export { app };
