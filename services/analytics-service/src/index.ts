import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AnalyticsService } from './services/analytics.service';
import { EventController } from './controllers/event.controller';
import { MetricsController } from './controllers/metrics.controller';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const analyticsService = new AnalyticsService();

// Initialize controllers
const eventController = new EventController(analyticsService);
const metricsController = new MetricsController(analyticsService);

// Routes
app.use('/events', eventController.router);
app.use('/metrics', metricsController.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'analytics-service',
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
  logger.info(`Analytics Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export { app };
