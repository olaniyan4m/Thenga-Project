import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from 'react-query';
import NetInfo from '@react-native-netinfo/netinfo';
import { useAuth } from '../store/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { DashboardStats } from '../components/DashboardStats';
import { RecentOrders } from '../components/RecentOrders';
import { QuickActions } from '../components/QuickActions';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, syncQueue, addToSyncQueue } = useOfflineSync();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    async () => {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      return response.json();
    },
    {
      enabled: isOnline && !!user?.accessToken,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Load offline data when offline
  useEffect(() => {
    if (!isOnline) {
      loadOfflineData();
    }
  }, [isOnline]);

  const loadOfflineData = async () => {
    try {
      // Load cached dashboard data from SQLite
      const cachedData = await getCachedData('dashboard');
      if (cachedData) {
        setStats(cachedData);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const getCachedData = async (key: string) => {
    // Implementation for SQLite access
    // This would use react-native-sqlite-storage
    return null;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_order':
        // Navigate to new order screen
        break;
      case 'add_product':
        // Navigate to add product screen
        break;
      case 'view_orders':
        // Navigate to orders screen
        break;
      case 'scan_qr':
        // Open QR scanner
        break;
    }
  };

  if (isLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineIndicator />}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              Welcome back, {user?.name || 'Merchant'}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Here's what's happening with your business today
            </Text>
          </View>
          
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline Mode'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <DashboardStats 
          stats={dashboardData || stats}
          isLoading={isLoading}
          isOffline={!isOnline}
        />

        {/* Quick Actions */}
        <QuickActions onAction={handleQuickAction} />

        {/* Recent Orders */}
        <RecentOrders 
          isOffline={!isOnline}
        />

        {/* Offline Notice */}
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <View style={styles.offlineContent}>
              <Text style={styles.offlineIcon}>📱</Text>
              <View style={styles.offlineText}>
                <Text style={styles.offlineTitle}>You're in Offline Mode</Text>
                <Text style={styles.offlineDescription}>
                  Your data is being saved locally and will sync when you're back online.
                </Text>
                {syncQueue.length > 0 && (
                  <Text style={styles.syncQueueText}>
                    {syncQueue.length} items pending sync
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Bottom padding for safe area */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  offlineNotice: {
    margin: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  offlineText: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  offlineDescription: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  syncQueueText: {
    fontSize: 12,
    color: '#856404',
    marginTop: 4,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 100,
  },
});
