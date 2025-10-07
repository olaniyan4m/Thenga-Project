import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface AppSelectorScreenProps {
  onAppSelected: (appType: 'business' | 'customer') => void;
}

export const AppSelectorScreen: React.FC<AppSelectorScreenProps> = ({ onAppSelected }) => {
  const navigation = useNavigation();

  const handleBusinessApp = () => {
    onAppSelected('business');
    // Navigate to business app
    navigation.navigate('BusinessApp' as never);
  };

  const handleCustomerApp = () => {
    onAppSelected('customer');
    // Navigate to customer app
    navigation.navigate('CustomerApp' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Pezela</Text>
        <Text style={styles.subtitle}>Choose Your App</Text>
      </View>

      <View style={styles.appsContainer}>
        {/* Business App Card */}
        <TouchableOpacity style={styles.appCard} onPress={handleBusinessApp}>
          <View style={styles.appIconContainer}>
            <Icon name="business" size={60} color="#2E7D32" />
          </View>
          <Text style={styles.appTitle}>Business App</Text>
          <Text style={styles.appDescription}>
            Manage orders, payments, products, and business settings
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>• Order Management</Text>
            <Text style={styles.feature}>• Payment Processing</Text>
            <Text style={styles.feature}>• Product Inventory</Text>
            <Text style={styles.feature}>• Business Analytics</Text>
            <Text style={styles.feature}>• Advanced Settings</Text>
          </View>
          <View style={styles.launchButton}>
            <Text style={styles.launchButtonText}>Launch Business App</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Customer App Card */}
        <TouchableOpacity style={styles.appCard} onPress={handleCustomerApp}>
          <View style={styles.appIconContainer}>
            <Icon name="shopping-cart" size={60} color="#1976D2" />
          </View>
          <Text style={styles.appTitle}>Customer App</Text>
          <Text style={styles.appDescription}>
            Browse products, place orders, and track your purchases
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.feature}>• Product Catalog</Text>
            <Text style={styles.feature}>• Order Tracking</Text>
            <Text style={styles.feature}>• Payment Methods</Text>
            <Text style={styles.feature}>• Order History</Text>
            <Text style={styles.feature}>• Customer Support</Text>
          </View>
          <View style={styles.launchButton}>
            <Text style={styles.launchButtonText}>Launch Customer App</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pezela - Complete Business Solution</Text>
        <Text style={styles.versionText}>Version 2.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  appsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  launchButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  launchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
