import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomerDashboardProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
  };
  isLoading: boolean;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading customer data...</Text>
      </View>
    );
  }

  const statCards = [
    {
      title: 'My Orders',
      value: stats.totalOrders.toString(),
      icon: 'receipt',
      color: '#1976D2',
    },
    {
      title: 'Total Spent',
      value: `R${stats.totalSpent.toLocaleString()}`,
      icon: 'attach-money',
      color: '#2E7D32',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: 'schedule',
      color: '#FF9800',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders.toString(),
      icon: 'check-circle',
      color: '#4CAF50',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome to Thenga!</Text>
        <Text style={styles.welcomeSubtitle}>Your shopping companion</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="shopping-bag" size={24} color="#1976D2" />
            <Text style={styles.quickActionText}>Browse Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="receipt" size={24} color="#2E7D32" />
            <Text style={styles.quickActionText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="payment" size={24} color="#FF9800" />
            <Text style={styles.quickActionText}>Payment Methods</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="support" size={24} color="#9C27B0" />
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Products */}
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <View style={styles.featuredCard}>
          <Text style={styles.featuredText}>Discover amazing products</Text>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore Products</Text>
            <Icon name="arrow-forward" size={16} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.recentOrdersContainer}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <View style={styles.recentOrdersCard}>
          <Text style={styles.recentOrdersText}>No recent orders</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Orders</Text>
            <Icon name="arrow-forward" size={16} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  welcomeContainer: {
    backgroundColor: '#1976D2',
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  featuredContainer: {
    padding: 16,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    marginRight: 8,
  },
  recentOrdersContainer: {
    padding: 16,
  },
  recentOrdersCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentOrdersText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
    marginRight: 8,
  },
});
