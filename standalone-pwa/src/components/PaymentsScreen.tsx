// 💳 Payments Management Screen
// Handles payment tracking, reconciliation, and financial reporting

import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/PaymentService';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}

interface PaymentsScreenProps {
  user: any;
  onLogout: () => void;
  payments: Payment[];
}

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ user, onLogout, payments }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Load live payment statistics
  useEffect(() => {
    const loadLiveStats = async () => {
      try {
        const stats = await paymentService.getBusinessPaymentStats();
        setLiveStats(stats);
      } catch (error) {
        console.error('Failed to load live payment stats:', error);
      }
    };

    loadLiveStats();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    return (
      (filterStatus === 'all' || payment.status === filterStatus) &&
      (filterMethod === 'all' || payment.method === filterMethod) &&
      paymentDate >= startDate && paymentDate <= endDate
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#757575';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card': return '💳';
      case 'cash': return '💵';
      case 'eft': return '🏦';
      default: return '💰';
    }
  };

  const getTotalAmount = () => {
    if (liveStats?.totalAmount) {
      return liveStats.totalAmount;
    }
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getCompletedAmount = () => {
    if (liveStats?.completedAmount) {
      return liveStats.completedAmount;
    }
    return filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingAmount = () => {
    if (liveStats?.pendingAmount) {
      return liveStats.pendingAmount;
    }
    return filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getFailedAmount = () => {
    if (liveStats?.failedAmount) {
      return liveStats.failedAmount;
    }
    return filteredPayments
      .filter(p => p.status === 'failed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-left">
          <img src="/assets/Logo2.PNG" alt="Pezela Logo" className="header-logo" />
          <h1>Payments ({payments.length})</h1>
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="screen-content">
        {/* Payment Stats */}
        <div className="payment-stats">
          <div className="stat-card">
            <h3>Total Amount</h3>
            <p>R{getTotalAmount().toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>R{getCompletedAmount().toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>R{getPendingAmount().toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <p>R{getFailedAmount().toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="payment-filters">
          <div className="filter-group">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Method:</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="eft">EFT</option>
            </select>
          </div>
        </div>

        {/* Payments List */}
        <div className="payments-list">
          <h3>Payment Transactions</h3>
          {filteredPayments.length === 0 ? (
            <div className="no-payments">
              <p>No payments found for the selected criteria</p>
            </div>
          ) : (
            filteredPayments.map(payment => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-info">
                    <h4>Payment #{payment.id.slice(-8)}</h4>
                    <p className="payment-customer">
                      {payment.customerName || 'Unknown Customer'}
                    </p>
                    <p className="payment-time">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="payment-amount">
                    <span className="amount">R{payment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="payment-details">
                  <div className="payment-method">
                    <span className="method-icon">{getMethodIcon(payment.method)}</span>
                    <span className="method-name">{payment.method.toUpperCase()}</span>
                  </div>
                  <div className="payment-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="payment-actions">
                  <button
                    className="details-btn"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    View Details
                  </button>
                  {payment.status === 'pending' && (
                    <button className="process-btn">
                      Process Payment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Payment Details</h3>
                <button onClick={() => setSelectedPayment(null)} className="close-btn">×</button>
              </div>
              <div className="modal-content">
                <div className="payment-details-full">
                  <div className="detail-section">
                    <h4>Transaction Information</h4>
                    <div className="detail-row">
                      <span>Payment ID:</span>
                      <span>{selectedPayment.id}</span>
                    </div>
                    <div className="detail-row">
                      <span>Order ID:</span>
                      <span>{selectedPayment.orderId}</span>
                    </div>
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span>R{selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Method:</span>
                      <span>{selectedPayment.method.toUpperCase()}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span 
                        className="status-text"
                        style={{ color: getStatusColor(selectedPayment.status) }}
                      >
                        {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedPayment.customerName && (
                    <div className="detail-section">
                      <h4>Customer Information</h4>
                      <div className="detail-row">
                        <span>Name:</span>
                        <span>{selectedPayment.customerName}</span>
                      </div>
                      {selectedPayment.customerPhone && (
                        <div className="detail-row">
                          <span>Phone:</span>
                          <span>{selectedPayment.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>Payment Summary</h4>
                    <div className="payment-summary">
                      <div className="summary-row">
                        <span>Gross Amount:</span>
                        <span>R{selectedPayment.amount.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Processing Fee (3%):</span>
                        <span>-R{(selectedPayment.amount * 0.03).toFixed(2)}</span>
                      </div>
                      <div className="summary-row total">
                        <span><strong>Net Amount:</strong></span>
                        <span><strong>R{(selectedPayment.amount * 0.97).toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsScreen;

