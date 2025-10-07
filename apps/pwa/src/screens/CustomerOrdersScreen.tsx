import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { OfflineIndicator } from '../components/OfflineIndicator';

interface CustomerOrder {
  id: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  date: string;
  trackingNumber: string;
}

export const CustomerOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Mock order data
      const mockOrders: CustomerOrder[] = [
        {
          id: '12345',
          items: ['Beef Kota', 'Chips', 'Coca Cola'],
          total: 72.00,
          status: 'delivered',
          date: '2025-09-28',
          trackingNumber: 'TRK12345',
        },
        {
          id: '12346',
          items: ['Chicken Kota', 'Fanta'],
          total: 54.00,
          status: 'preparing',
          date: '2025-10-01',
          trackingNumber: 'TRK12346',
        },
        {
          id: '12347',
          items: ['Classic Kota'],
          total: 38.00,
          status: 'pending',
          date: '2025-10-01',
          trackingNumber: 'TRK12347',
        },
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      case 'delivered': return '#8bc34a';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="customer-orders-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="orders-container"
      >
        {/* Header */}
        <div className="orders-header">
          <h1>📋 My Orders</h1>
          <p>Track your orders and delivery status</p>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="order-card"
            >
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">{order.date}</p>
                </div>
                <div 
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="order-items">
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: R{order.total.toFixed(2)}</strong>
                </div>
                <div className="order-tracking">
                  <span>Tracking: {order.trackingNumber}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <button 
              className="shop-now-btn"
              onClick={() => window.location.href = '/products'}
            >
              Shop Now
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
