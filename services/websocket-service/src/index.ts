import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { RedisClient } from './services/redis.service';
import { SocketHandler } from './handlers/socket.handler';
import { AuthService } from './services/auth.service';
import { logger } from './utils/logger';
import { NotificationService } from './services/notification.service';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3004;

// Initialize Redis
const redisClient = new RedisClient();

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const authService = new AuthService();
const notificationService = new NotificationService(redisClient);

// Initialize socket handler
const socketHandler = new SocketHandler(io, authService, notificationService, redisClient);

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'websocket-service',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
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
  logger.info('Shutting down WebSocket service...');
  await redisClient.disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down WebSocket service...');
  await redisClient.disconnect();
  server.close(() => {
    process.exit(0);
  });
});

server.listen(PORT, () => {
  logger.info(`WebSocket Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export { app, server, io };
