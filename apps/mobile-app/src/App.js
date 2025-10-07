import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';

const App = () => {
  const [activeApp, setActiveApp] = useState(null);

  const handleBusinessPress = () => {
    setActiveApp('business');
  };

  const handleCustomerPress = () => {
    setActiveApp('customer');
  };

  const renderBusinessApp = () => (
    <View style={styles.appContainer}>
      <Text style={styles.appTitle}>🏢 THENGA BUSINESS APP</Text>
      <Text style={styles.appDescription}>
        Manage your business with Thenga's powerful tools:
      </Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>📊 Dashboard & Analytics</Text>
        <Text style={styles.featureItem}>📦 Product Management</Text>
        <Text style={styles.featureItem}>📋 Order Processing</Text>
        <Text style={styles.featureItem}>💳 Payment Tracking</Text>
        <Text style={styles.featureItem}>👥 Customer Management</Text>
        <Text style={styles.featureItem}>📈 Sales Reports</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveApp(null)}>
        <Text style={styles.buttonText}>← Back to Main</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCustomerApp = () => (
    <View style={styles.appContainer}>
      <Text style={styles.appTitle}>🛒 THENGA CUSTOMER APP</Text>
      <Text style={styles.appDescription}>
        Shop with Thenga's customer-friendly features:
      </Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>🛍️ Browse Products</Text>
        <Text style={styles.featureItem}>🛒 Shopping Cart</Text>
        <Text style={styles.featureItem}>📱 Easy Checkout</Text>
        <Text style={styles.featureItem}>💳 Secure Payments</Text>
        <Text style={styles.featureItem}>📦 Order Tracking</Text>
        <Text style={styles.featureItem}>⭐ Reviews & Ratings</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveApp(null)}>
        <Text style={styles.buttonText}>← Back to Main</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMainScreen = () => (
    <View style={styles.body}>
      <Text style={styles.title}>🎉 THENGA REACT NATIVE APP 🎉</Text>
      <Text style={styles.subtitle}>Choose your app experience:</Text>
      
      <TouchableOpacity style={styles.businessButton} onPress={handleBusinessPress}>
        <Text style={styles.buttonText}>🏢 Business App</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.customerButton} onPress={handleCustomerPress}>
        <Text style={styles.buttonText}>🛒 Customer App</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {activeApp === 'business' ? renderBusinessApp() : 
         activeApp === 'customer' ? renderCustomerApp() : 
         renderMainScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  businessButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: 250,
    alignItems: 'center',
  },
  customerButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  featureList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 10,
  },
  backButton: {
    backgroundColor: '#666',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;
