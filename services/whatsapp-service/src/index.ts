import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { WebhookController } from './controllers/webhook.controller';
import { MessageController } from './controllers/message.controller';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize WhatsApp Service
const whatsappService = new WhatsAppService();

// Controllers
const webhookController = new WebhookController(whatsappService);
const messageController = new MessageController(whatsappService);

// Routes
app.use('/webhook', webhookController.router);
app.use('/messages', messageController.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'whatsapp-service',
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

app.listen(PORT, () => {
  logger.info(`WhatsApp Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export { app };
