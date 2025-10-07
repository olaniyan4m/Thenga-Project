import React, { useState } from 'react';

interface Merchant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    idDocument: string;
    businessLicense: string;
    bankStatement: string;
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
}

interface Dispute {
  id: string;
  merchantId: string;
  merchantName: string;
  orderId: string;
  customerName: string;
  issue: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'verification' | 'disputes' | 'logs'>('dashboard');

  // Mock data
  const [merchants] = useState<Merchant[]>([
    {
      id: '1',
      name: 'John Smith',
      businessName: 'Smith Coffee Shop',
      email: 'john@smithcoffee.co.za',
      phone: '+27821234567',
      kycStatus: 'pending',
      documents: {
        idDocument: 'ID_12345.pdf',
        businessLicense: 'LICENSE_67890.pdf',
        bankStatement: 'BANK_11111.pdf'
      },
      submittedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      businessName: 'Johnson Bakery',
      email: 'sarah@johnsonbakery.co.za',
      phone: '+27829876543',
      kycStatus: 'verified',
      documents: {
        idDocument: 'ID_54321.pdf',
        businessLicense: 'LICENSE_09876.pdf',
        bankStatement: 'BANK_22222.pdf'
      },
      submittedAt: '2024-01-10T14:20:00Z',
      reviewedAt: '2024-01-12T09:15:00Z',
      reviewer: 'Admin User'
    }
  ]);

  const [disputes] = useState<Dispute[]>([
    {
      id: '1',
      merchantId: '1',
      merchantName: 'Smith Coffee Shop',
      orderId: 'ORD-001',
      customerName: 'Mike Wilson',
      issue: 'Customer claims order was not delivered',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-01-20T16:45:00Z'
    },
    {
      id: '2',
      merchantId: '2',
      merchantName: 'Johnson Bakery',
      orderId: 'ORD-002',
      customerName: 'Lisa Brown',
      issue: 'Payment charged twice for same order',
      status: 'investigating',
      priority: 'high',
      createdAt: '2024-01-19T11:30:00Z'
    }
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-20T15:30:00Z',
      action: 'LOGIN',
      entity: 'USER',
      entityId: 'user_123',
      userId: 'admin_001',
      details: 'Admin user logged in from desktop',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      timestamp: '2024-01-20T14:15:00Z',
      action: 'UPDATE_ORDER',
      entity: 'ORDER',
      entityId: 'ORD-001',
      userId: 'merchant_456',
      details: 'Order status changed from pending to confirmed',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    }
  ]);

  const handleVerifyMerchant = (merchantId: string, status: 'verified' | 'rejected') => {
    alert(`Merchant ${merchantId} ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
  };

  const handleResolveDispute = (disputeId: string) => {
    alert(`Dispute ${disputeId} resolved successfully!`);
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Merchants</h3>
          <div className="stat-number">{merchants.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Verification</h3>
          <div className="stat-number">{merchants.filter(m => m.kycStatus === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <h3>Open Disputes</h3>
          <div className="stat-number">{disputes.filter(d => d.status === 'open').length}</div>
        </div>
        <div className="stat-card">
          <h3>System Logs</h3>
          <div className="stat-number">{auditLogs.length}</div>
        </div>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="admin-verification">
      <h2>Merchant Verification</h2>
      <div className="verification-list">
        {merchants.map(merchant => (
          <div key={merchant.id} className="verification-card">
            <div className="merchant-info">
              <h3>{merchant.businessName}</h3>
              <p>Owner: {merchant.name}</p>
              <p>Email: {merchant.email}</p>
              <p>Phone: {merchant.phone}</p>
              <p>Status: <span className={`status ${merchant.kycStatus}`}>{merchant.kycStatus}</span></p>
            </div>
            <div className="documents">
              <h4>Documents:</h4>
              <ul>
                <li>ID Document: {merchant.documents.idDocument}</li>
                <li>Business License: {merchant.documents.businessLicense}</li>
                <li>Bank Statement: {merchant.documents.bankStatement}</li>
              </ul>
            </div>
            {merchant.kycStatus === 'pending' && (
              <div className="verification-actions">
                <button 
                  className="verify-btn"
                  onClick={() => handleVerifyMerchant(merchant.id, 'verified')}
                >
                  Verify
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleVerifyMerchant(merchant.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDisputes = () => (
    <div className="admin-disputes">
      <h2>Disputes Management</h2>
      <div className="disputes-list">
        {disputes.map(dispute => (
          <div key={dispute.id} className="dispute-card">
            <div className="dispute-header">
              <h3>Dispute #{dispute.id}</h3>
              <span className={`priority ${dispute.priority}`}>{dispute.priority}</span>
              <span className={`status ${dispute.status}`}>{dispute.status}</span>
            </div>
            <div className="dispute-details">
              <p><strong>Merchant:</strong> {dispute.merchantName}</p>
              <p><strong>Order:</strong> {dispute.orderId}</p>
              <p><strong>Customer:</strong> {dispute.customerName}</p>
              <p><strong>Issue:</strong> {dispute.issue}</p>
              <p><strong>Created:</strong> {new Date(dispute.createdAt).toLocaleString()}</p>
            </div>
            {dispute.status !== 'resolved' && (
              <div className="dispute-actions">
                <button 
                  className="resolve-btn"
                  onClick={() => handleResolveDispute(dispute.id)}
                >
                  Resolve
                </button>
                <button className="investigate-btn">
                  Investigate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="admin-logs">
      <h2>System Audit Logs</h2>
      <div className="logs-filters">
        <select>
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="UPDATE_ORDER">Order Updates</option>
          <option value="PAYMENT">Payments</option>
        </select>
        <input type="date" placeholder="From Date" />
        <input type="date" placeholder="To Date" />
      </div>
      <div className="logs-list">
        {auditLogs.map(log => (
          <div key={log.id} className="log-entry">
            <div className="log-header">
              <span className="log-action">{log.action}</span>
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <div className="log-details">
              <p><strong>Entity:</strong> {log.entity} ({log.entityId})</p>
              <p><strong>User:</strong> {log.userId}</p>
              <p><strong>Details:</strong> {log.details}</p>
              <p><strong>IP:</strong> {log.ipAddress}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Pezela Admin Panel</h1>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'verification' ? 'active' : ''}
            onClick={() => setActiveTab('verification')}
          >
            Verification
          </button>
          <button 
            className={activeTab === 'disputes' ? 'active' : ''}
            onClick={() => setActiveTab('disputes')}
          >
            Disputes
          </button>
          <button 
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'verification' && renderVerification()}
        {activeTab === 'disputes' && renderDisputes()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
};

export default AdminPanel;
