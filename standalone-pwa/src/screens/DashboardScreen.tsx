import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { DashboardStats } from '../components/DashboardStats';
import { RecentOrders } from '../components/RecentOrders';
import { QuickActions } from '../components/QuickActions';
import { OfflineIndicator } from '../components/OfflineIndicator';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    {
      enabled: isOnline,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Load offline data when online
  useEffect(() => {
    if (!isOnline) {
      // Load cached data from IndexedDB
      loadOfflineData();
    }
  }, [isOnline]);

  const loadOfflineData = async () => {
    try {
      // Load cached dashboard data from IndexedDB
      const cachedData = await getCachedData('dashboard');
      if (cachedData) {
        setStats(cachedData);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const getCachedData = async (key: string) => {
    // Implementation for IndexedDB access
    return null;
  };

  return (
    <div className="dashboard-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dashboard-container"
      >
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user?.name || 'Merchant'}! 👋
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your business today
            </p>
          </div>
          
          <div className="status-indicator">
            <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
            <span className="status-text">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats 
          stats={dashboardData || stats}
          isLoading={isLoading}
          isOffline={!isOnline}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Orders */}
        <RecentOrders 
          isOffline={!isOnline}
        />

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
