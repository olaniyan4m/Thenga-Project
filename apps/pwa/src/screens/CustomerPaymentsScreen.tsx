import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { OfflineIndicator } from '../components/OfflineIndicator';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  orderId: string;
}

export const CustomerPaymentsScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // Mock payment data
      const mockPayments: Payment[] = [
        {
          id: 'PAY001',
          amount: 72.00,
          method: 'Card',
          status: 'completed',
          date: '2025-09-28',
          orderId: '12345',
        },
        {
          id: 'PAY002',
          amount: 54.00,
          method: 'Cash',
          status: 'completed',
          date: '2025-10-01',
          orderId: '12346',
        },
        {
          id: 'PAY003',
          amount: 38.00,
          method: 'Card',
          status: 'pending',
          date: '2025-10-01',
          orderId: '12347',
        },
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#666';
    }
  };

  const getTotalSpent = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="customer-payments-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="payments-container"
      >
        {/* Header */}
        <div className="payments-header">
          <h1>💳 Payment History</h1>
          <p>View your payment transactions</p>
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <h3>Total Spent</h3>
              <p className="summary-value">R{getTotalSpent().toFixed(2)}</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>Transactions</h3>
              <p className="summary-value">{payments.length}</p>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="payments-list">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="payment-card"
            >
              <div className="payment-header">
                <div className="payment-info">
                  <h3>Payment #{payment.id}</h3>
                  <p className="payment-date">{payment.date}</p>
                </div>
                <div 
                  className="payment-status"
                  style={{ color: getStatusColor(payment.status) }}
                >
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </div>
              </div>
              
              <div className="payment-details">
                <div className="payment-amount">
                  <strong>R{payment.amount.toFixed(2)}</strong>
                </div>
                <div className="payment-method">
                  <span>Method: {payment.method}</span>
                </div>
                <div className="payment-order">
                  <span>Order: #{payment.orderId}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {payments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No payments yet</h3>
            <p>Your payment history will appear here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
