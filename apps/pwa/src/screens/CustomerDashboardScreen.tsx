import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { OfflineIndicator } from '../components/OfflineIndicator';

export const CustomerDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Load customer data
  useEffect(() => {
    if (isOnline) {
      // Load live customer data
      loadCustomerData();
    } else {
      // Load offline data
      loadOfflineData();
    }
  }, [isOnline]);

  const loadCustomerData = async () => {
    try {
      // Simulate API call for customer data
      const mockData = {
        totalOrders: 12,
        totalSpent: 2450.00,
        pendingOrders: 2,
        completedOrders: 10,
      };
      setCustomerStats(mockData);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    }
  };

  const loadOfflineData = async () => {
    try {
      // Load cached customer data
      const cachedData = {
        totalOrders: 8,
        totalSpent: 1800.00,
        pendingOrders: 1,
        completedOrders: 7,
      };
      setCustomerStats(cachedData);
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  return (
    <div className="customer-dashboard-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="customer-dashboard-container"
      >
        {/* Header */}
        <div className="customer-dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome, {user?.name || 'Customer'}! 🛒
            </h1>
            <p className="welcome-subtitle">
              Your shopping experience with Pezela
            </p>
          </div>
          
          <div className="status-indicator">
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
            <span className="status-text">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="customer-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{customerStats.totalOrders}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Spent</h3>
              <p className="stat-value">R{customerStats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Orders</h3>
              <p className="stat-value">{customerStats.pendingOrders}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-value">{customerStats.completedOrders}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="customer-quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="action-btn"
              onClick={() => window.location.href = '/products'}
            >
              <div className="action-icon">🛍️</div>
              <div className="action-text">Shop Now</div>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="action-btn"
              onClick={() => window.location.href = '/orders'}
            >
              <div className="action-icon">📋</div>
              <div className="action-text">Track Orders</div>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="action-btn"
              onClick={() => window.location.href = '/payments'}
            >
              <div className="action-icon">💳</div>
              <div className="action-text">Payment History</div>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="action-btn"
              onClick={() => window.location.href = '/settings'}
            >
              <div className="action-icon">⚙️</div>
              <div className="action-text">Account Settings</div>
            </motion.button>
          </div>
        </div>

        {/* Recent Orders Preview */}
        <div className="recent-orders-preview">
          <h2>Recent Orders</h2>
          <div className="orders-list">
            <div className="order-item">
              <div className="order-info">
                <h4>Order #12345</h4>
                <p>Beef Kota + Chips</p>
              </div>
              <div className="order-status completed">Completed</div>
            </div>
            
            <div className="order-item">
              <div className="order-info">
                <h4>Order #12346</h4>
                <p>Chicken Kota + Fanta</p>
              </div>
              <div className="order-status pending">Preparing</div>
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="offline-notice"
          >
            <div className="offline-content">
              <div className="offline-icon">📱</div>
              <div className="offline-text">
                <h3>You're in Offline Mode</h3>
                <p>Your data is being saved locally and will sync when you're back online.</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
