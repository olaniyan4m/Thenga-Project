import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface CustomerPaymentsProps {
  payments: any[];
  onRefresh: () => void;
}

export const CustomerPayments: React.FC<CustomerPaymentsProps> = ({ payments, onRefresh }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.emptyText}>No payments available</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#666' },
});
