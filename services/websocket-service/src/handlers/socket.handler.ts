import { Socket } from 'socket.io';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { RedisClient } from '../services/redis.service';
import { logger } from '../utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  merchantId?: string;
  userRole?: string;
}

export interface SocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export class SocketHandler {
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private merchantRooms: Map<string, Set<string>> = new Map(); // merchantId -> Set of socketIds

  constructor(
    private io: SocketIOServer,
    private authService: AuthService,
    private notificationService: NotificationService,
    private redisClient: RedisClient
  ) {}

  /**
   * Handle new socket connection
   */
  handleConnection(socket: AuthenticatedSocket): void {
    logger.info(`New socket connection: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', async (data: { token: string }) => {
      try {
        const user = await this.authService.verifyToken(data.token);
        if (user) {
          socket.userId = user.id;
          socket.merchantId = user.merchantId;
          socket.userRole = user.role;
          
          // Join user-specific room
          socket.join(`user:${user.id}`);
          
          // Join merchant room if applicable
          if (user.merchantId) {
            socket.join(`merchant:${user.merchantId}`);
            this.addToMerchantRoom(user.merchantId, socket.id);
          }
          
          // Store user connection
          this.connectedUsers.set(user.id, socket.id);
          
          // Send authentication success
          socket.emit('authenticated', { 
            success: true, 
            user: { id: user.id, role: user.role, merchantId: user.merchantId }
          });
          
          logger.info(`User authenticated: ${user.id} (${user.role})`);
        } else {
          socket.emit('authentication_error', { message: 'Invalid token' });
        }
      } catch (error) {
        logger.error('Authentication error:', error);
        socket.emit('authentication_error', { message: 'Authentication failed' });
      }
    });

    // Handle order updates
    socket.on('order_update', async (data: { orderId: string, status: string }) => {
      try {
        if (!socket.merchantId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Broadcast to merchant room
        this.io.to(`merchant:${socket.merchantId}`).emit('order_updated', {
          orderId: data.orderId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });

        // Store in Redis for persistence
        await this.redisClient.set(
          `order:${data.orderId}:status`,
          data.status,
          3600 // 1 hour TTL
        );

        logger.info(`Order ${data.orderId} status updated to ${data.status}`);
      } catch (error) {
        logger.error('Error handling order update:', error);
        socket.emit('error', { message: 'Failed to update order' });
      }
    });

    // Handle payment updates
    socket.on('payment_update', async (data: { orderId: string, paymentId: string, status: string }) => {
      try {
        if (!socket.merchantId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Broadcast to merchant room
        this.io.to(`merchant:${socket.merchantId}`).emit('payment_updated', {
          orderId: data.orderId,
          paymentId: data.paymentId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });

        // Store in Redis
        await this.redisClient.set(
          `payment:${data.paymentId}:status`,
          data.status,
          3600
        );

        logger.info(`Payment ${data.paymentId} status updated to ${data.status}`);
      } catch (error) {
        logger.error('Error handling payment update:', error);
        socket.emit('error', { message: 'Failed to update payment' });
      }
    });

    // Handle inventory updates
    socket.on('inventory_update', async (data: { productId: string, stock: number, action: string }) => {
      try {
        if (!socket.merchantId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Broadcast to merchant room
        this.io.to(`merchant:${socket.merchantId}`).emit('inventory_updated', {
          productId: data.productId,
          stock: data.stock,
          action: data.action,
          timestamp: new Date().toISOString(),
        });

        // Store in Redis
        await this.redisClient.set(
          `product:${data.productId}:stock`,
          data.stock.toString(),
          3600
        );

        logger.info(`Product ${data.productId} stock updated to ${data.stock}`);
      } catch (error) {
        logger.error('Error handling inventory update:', error);
        socket.emit('error', { message: 'Failed to update inventory' });
      }
    });

    // Handle customer messages
    socket.on('customer_message', async (data: { customerId: string, message: string, channel: string }) => {
      try {
        if (!socket.merchantId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Broadcast to merchant room
        this.io.to(`merchant:${socket.merchantId}`).emit('customer_message_received', {
          customerId: data.customerId,
          message: data.message,
          channel: data.channel,
          timestamp: new Date().toISOString(),
        });

        // Store in Redis for persistence
        await this.redisClient.lpush(
          `customer:${data.customerId}:messages`,
          JSON.stringify({
            message: data.message,
            channel: data.channel,
            timestamp: new Date().toISOString(),
          })
        );

        logger.info(`Customer message from ${data.customerId}: ${data.message}`);
      } catch (error) {
        logger.error('Error handling customer message:', error);
        socket.emit('error', { message: 'Failed to process customer message' });
      }
    });

    // Handle notifications
    socket.on('send_notification', async (data: { 
      targetUserId: string, 
      type: string, 
      message: string, 
      data?: any 
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Send notification to specific user
        const targetSocket = this.connectedUsers.get(data.targetUserId);
        if (targetSocket) {
          this.io.to(targetSocket).emit('notification', {
            type: data.type,
            message: data.message,
            data: data.data,
            timestamp: new Date().toISOString(),
          });
        }

        // Store notification in Redis
        await this.notificationService.storeNotification({
          targetUserId: data.targetUserId,
          type: data.type,
          message: data.message,
          data: data.data,
        });

        logger.info(`Notification sent to user ${data.targetUserId}`);
      } catch (error) {
        logger.error('Error sending notification:', error);
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { channel: string, customerId?: string }) => {
      if (socket.merchantId) {
        this.io.to(`merchant:${socket.merchantId}`).emit('user_typing', {
          userId: socket.userId,
          channel: data.channel,
          customerId: data.customerId,
        });
      }
    });

    socket.on('typing_stop', (data: { channel: string, customerId?: string }) => {
      if (socket.merchantId) {
        this.io.to(`merchant:${socket.merchantId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          channel: data.channel,
          customerId: data.customerId,
        });
      }
    });

    // Handle presence updates
    socket.on('update_presence', (data: { status: 'online' | 'away' | 'busy' | 'offline' }) => {
      if (socket.userId && socket.merchantId) {
        this.io.to(`merchant:${socket.merchantId}`).emit('presence_updated', {
          userId: socket.userId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        this.connectedUsers.delete(socket.userId);
        
        if (socket.merchantId) {
          this.removeFromMerchantRoom(socket.merchantId, socket.id);
          
          // Notify merchant room of user going offline
          this.io.to(`merchant:${socket.merchantId}`).emit('user_offline', {
            userId: socket.userId,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  }

  /**
   * Add socket to merchant room
   */
  private addToMerchantRoom(merchantId: string, socketId: string): void {
    if (!this.merchantRooms.has(merchantId)) {
      this.merchantRooms.set(merchantId, new Set());
    }
    this.merchantRooms.get(merchantId)!.add(socketId);
  }

  /**
   * Remove socket from merchant room
   */
  private removeFromMerchantRoom(merchantId: string, socketId: string): void {
    const room = this.merchantRooms.get(merchantId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.merchantRooms.delete(merchantId);
      }
    }
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Broadcast to specific merchant
   */
  broadcastToMerchant(merchantId: string, event: string, data: any): void {
    this.io.to(`merchant:${merchantId}`).emit(event, data);
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get merchant room users count
   */
  getMerchantUsersCount(merchantId: string): number {
    const room = this.merchantRooms.get(merchantId);
    return room ? room.size : 0;
  }
}
