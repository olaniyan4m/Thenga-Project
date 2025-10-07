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

interface BusinessDashboardProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  };
  isLoading: boolean;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading business data...</Text>
      </View>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: 'receipt',
      color: '#2E7D32',
    },
    {
      title: 'Total Revenue',
      value: `R${stats.totalRevenue.toLocaleString()}`,
      icon: 'attach-money',
      color: '#1976D2',
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
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
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
            <Icon name="add" size={24} color="#2E7D32" />
            <Text style={styles.quickActionText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="inventory" size={24} color="#1976D2" />
            <Text style={styles.quickActionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="payment" size={24} color="#FF9800" />
            <Text style={styles.quickActionText}>Process Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Icon name="analytics" size={24} color="#9C27B0" />
            <Text style={styles.quickActionText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Calculator */}
      <View style={styles.calculatorContainer}>
        <Text style={styles.sectionTitle}>Business Calculator</Text>
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Quick Calculations</Text>
          <View style={styles.calculatorButtons}>
            <TouchableOpacity style={styles.calculatorButton}>
              <Text style={styles.calculatorButtonText}>Profit Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculatorButton}>
              <Text style={styles.calculatorButtonText}>VAT Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculatorButton}>
              <Text style={styles.calculatorButtonText}>Margin Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculatorButton}>
              <Text style={styles.calculatorButtonText}>Discount Calculator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.recentOrdersContainer}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <View style={styles.recentOrdersCard}>
          <Text style={styles.recentOrdersText}>No recent orders</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Orders</Text>
            <Icon name="arrow-forward" size={16} color="#2E7D32" />
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
  calculatorContainer: {
    padding: 16,
  },
  calculatorCard: {
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
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  calculatorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calculatorButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  calculatorButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
    color: '#2E7D32',
    fontWeight: '600',
    marginRight: 8,
  },
});
