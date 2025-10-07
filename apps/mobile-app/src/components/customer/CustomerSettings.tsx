import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface CustomerSettingsProps {
  onRefresh: () => void;
}

export const CustomerSettings: React.FC<CustomerSettingsProps> = ({ onRefresh }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.emptyText}>Settings will be available here</Text>
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
