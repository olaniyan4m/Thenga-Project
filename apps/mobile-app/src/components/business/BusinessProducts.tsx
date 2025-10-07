import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface BusinessProductsProps {
  products: any[];
  onRefresh: () => void;
}

export const BusinessProducts: React.FC<BusinessProductsProps> = ({ products, onRefresh }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.emptyText}>No products available</Text>
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
