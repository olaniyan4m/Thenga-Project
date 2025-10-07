import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: 'card' | 'eft' | 'qr' | 'cash';
  provider: 'payfast' | 'yoco' | 'snapscan' | 'zapper';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  customerName: string;
  paymentUrl?: string;
}

export const PaymentsScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  // Fetch payments
  const { data: payments, isLoading } = useQuery(
    'payments',
    async () => {
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
    {
      enabled: !!user?.accessToken,
      retry: 3,
    }
  );

  // Mock payments for demo
  const mockPayments: Payment[] = [
    {
      id: '1',
      orderId: 'ORD-001',
      amount: 150.00,
      currency: 'ZAR',
      method: 'card',
      provider: 'payfast',
      status: 'paid',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      customerName: 'John Smith',
    },
    {
      id: '2',
      orderId: 'ORD-002',
      amount: 85.50,
      currency: 'ZAR',
      method: 'qr',
      provider: 'snapscan',
      status: 'paid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      customerName: 'Sarah Johnson',
    },
    {
      id: '3',
      orderId: 'ORD-003',
      amount: 200.00,
      currency: 'ZAR',
      method: 'eft',
      provider: 'yoco',
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      customerName: 'Mike Wilson',
    },
  ];

  const displayPayments = payments || mockPayments;

  const filteredPayments = selectedMethod === 'all' 
    ? displayPayments 
    : displayPayments.filter(payment => payment.method === selectedMethod);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      case 'refunded': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      case 'refunded': return '🔄';
      default: return '💰';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return '💳';
      case 'eft': return '🏦';
      case 'qr': return '📱';
      case 'cash': return '💵';
      default: return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleRefund = (paymentId: string) => {
    console.log(`Refunding payment ${paymentId}`);
  };

  const totalRevenue = displayPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = displayPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="payments-screen">
      <div className="phone-frame">
        <div className="phone-screen">
          {/* Header */}
          <div className="screen-header">
            <h1>Payments</h1>
            <div className="header-actions">
              <button className="refresh-button">🔄</button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <div className="summary-label">Total Revenue</div>
                <div className="summary-value">R{totalRevenue.toFixed(2)}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏳</div>
              <div className="summary-content">
                <div className="summary-label">Pending</div>
                <div className="summary-value">R{pendingAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', count: displayPayments.length },
              { key: 'card', label: 'Card', count: displayPayments.filter(p => p.method === 'card').length },
              { key: 'qr', label: 'QR', count: displayPayments.filter(p => p.method === 'qr').length },
              { key: 'eft', label: 'EFT', count: displayPayments.filter(p => p.method === 'eft').length },
              { key: 'cash', label: 'Cash', count: displayPayments.filter(p => p.method === 'cash').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedMethod(tab.key)}
                className={`filter-tab ${selectedMethod === tab.key ? 'active' : ''}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Payments List */}
          <div className="payments-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No payments found</h3>
                <p>Payments will appear here when customers pay</p>
              </div>
            ) : (
              <div className="payments-list">
                {filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="payment-card"
                  >
                    <div className="payment-header">
                      <div className="payment-method">
                        <span className="method-icon">{getMethodIcon(payment.method)}</span>
                        <span className="method-name">{payment.method.toUpperCase()}</span>
                      </div>
                      <div className="payment-time">{formatDate(payment.createdAt)}</div>
                    </div>

                    <div className="payment-info">
                      <div className="customer-name">{payment.customerName}</div>
                      <div className="order-reference">Order: #{payment.orderId}</div>
                    </div>

                    <div className="payment-amount">
                      R{payment.amount.toFixed(2)}
                    </div>

                    <div className="payment-status">
                      <span 
                        className="status-badge"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {getStatusIcon(payment.status)} {payment.status}
                      </span>
                      <span className="provider-name">{payment.provider}</span>
                    </div>

                    <div className="payment-actions">
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => handleRefund(payment.id)}
                          className="action-button refund"
                        >
                          Refund
                        </button>
                      )}
                      {payment.status === 'pending' && (
                        <button className="action-button pending">
                          Check Status
                        </button>
                      )}
                      <button className="action-button details">
                        View Details
                      </button>
                    </div>

                    {!isOnline && (
                      <div className="offline-indicator">
                        <span>📱 Offline</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .payments-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .phone-frame {
          width: 100%;
          max-width: 375px;
          height: 812px;
          background: #000;
          border-radius: 40px;
          padding: 8px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .screen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .screen-header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .refresh-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .refresh-button:hover {
          background: #f0f0f0;
        }

        .summary-cards {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: #f8f9fa;
        }

        .summary-card {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .summary-icon {
          font-size: 20px;
        }

        .summary-content {
          flex: 1;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }

        .summary-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .filter-tabs {
          display: flex;
          padding: 16px 20px 0;
          gap: 8px;
          overflow-x: auto;
          border-bottom: 1px solid #e0e0e0;
        }

        .filter-tab {
          background: #f5f5f5;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #2E7D32;
          color: white;
        }

        .payments-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2E7D32;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          color: #333;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #666;
          margin: 0;
        }

        .payments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .method-icon {
          font-size: 16px;
        }

        .method-name {
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }

        .payment-time {
          font-size: 12px;
          color: #666;
        }

        .payment-info {
          margin-bottom: 12px;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .order-reference {
          font-size: 12px;
          color: #666;
        }

        .payment-amount {
          font-size: 20px;
          font-weight: bold;
          color: #2E7D32;
          margin-bottom: 12px;
        }

        .payment-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 500;
        }

        .provider-name {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
        }

        .payment-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .action-button.refund {
          background: #f44336;
          color: white;
        }

        .action-button.pending {
          background: #ff9800;
          color: white;
        }

        .action-button.details {
          background: #2196f3;
          color: white;
        }

        .offline-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 12px;
          color: #666;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 4px;
        }

        @media (max-width: 400px) {
          .phone-frame {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            padding: 0;
          }

          .phone-screen {
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};
