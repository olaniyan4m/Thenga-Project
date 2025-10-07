import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
    color?: string;
    variant?: string;
  }>;
}

export const OrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch orders
  const { data: orders, isLoading } = useQuery(
    'orders',
    async () => {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    {
      enabled: !!user?.accessToken,
      retry: 3,
    }
  );

  // Mock orders for demo
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Smith',
      customerPhone: '+27821234567',
      totalAmount: 150.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      items: [
        { name: 'Coffee', quantity: 2, price: 25.00, image: 'https://via.placeholder.com/60x60/8B4513/fff?text=☕', color: 'Black' },
        { name: 'Sandwich', quantity: 1, price: 45.00, image: 'https://via.placeholder.com/60x60/DEB887/fff?text=🥪', color: 'Brown' },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerPhone: '+27829876543',
      totalAmount: 85.50,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Tea', quantity: 1, price: 18.00, image: 'https://via.placeholder.com/60x60/90EE90/fff?text=🍵', color: 'Green' },
        { name: 'Muffin', quantity: 2, price: 15.00, image: 'https://via.placeholder.com/60x60/FFB6C1/fff?text=🧁', color: 'Blueberry' },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Wilson',
      customerPhone: '+27825551234',
      totalAmount: 200.00,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Lunch Special', quantity: 1, price: 120.00, image: 'https://via.placeholder.com/60x60/FFA500/fff?text=🍽️', color: 'Mixed' },
        { name: 'Drink', quantity: 1, price: 25.00, image: 'https://via.placeholder.com/60x60/FF6347/fff?text=🥤', color: 'Orange' },
      ],
    },
  ];

  const displayOrders = orders || mockOrders;

  const filteredOrders = selectedStatus === 'all' 
    ? displayOrders 
    : displayOrders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'ready': return '#9C27B0';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'ready': return '🚀';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#666';
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

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // Update order status
    console.log(`Updating order ${orderId} to ${newStatus}`);
  };

  return (
    <div className="orders-screen">
      <div className="phone-frame">
        <div className="phone-screen">
          {/* Header */}
          <div className="screen-header">
            <h1>Orders</h1>
            <div className="header-actions">
              <button className="refresh-button">🔄</button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', count: displayOrders.length },
              { key: 'pending', label: 'Pending', count: displayOrders.filter(o => o.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: displayOrders.filter(o => o.status === 'confirmed').length },
              { key: 'completed', label: 'Completed', count: displayOrders.filter(o => o.status === 'completed').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`filter-tab ${selectedStatus === tab.key ? 'active' : ''}`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="orders-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="order-card"
                  >
                    <div className="order-header">
                      <div className="order-number">#{order.orderNumber}</div>
                      <div className="order-time">{formatDate(order.createdAt)}</div>
                    </div>

                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      <div className="customer-phone">{order.customerPhone}</div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-card">
                          <div className="item-image">
                            <img 
                              src={item.image || 'https://via.placeholder.com/60x60/f0f0f0/666?text=📦'} 
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/60x60/f0f0f0/666?text=📦';
                              }}
                            />
                          </div>
                          <div className="item-details">
                            <div className="item-name">{item.name}</div>
                            {item.color && <div className="item-color">{item.color} colour</div>}
                            <div className="item-quantity-price">
                              <span className="item-quantity">× {item.quantity}</span>
                              <span className="item-price">R{item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        Total: <span className="total-amount">R{order.totalAmount.toFixed(2)}</span>
                      </div>
                      
                      <div className="order-status">
                        <span 
                          className="status-badge"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                        <span 
                          className="payment-status"
                          style={{ color: getPaymentStatusColor(order.paymentStatus) }}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="action-button confirm"
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="action-button ready"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                          className="action-button complete"
                        >
                          Complete Order
                        </button>
                      )}
                      <button className="action-button whatsapp">
                        💬 WhatsApp
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
        .orders-screen {
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

        .orders-content {
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

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .order-number {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .order-time {
          font-size: 12px;
          color: #666;
        }

        .customer-info {
          margin-bottom: 12px;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 2px;
        }

        .customer-phone {
          font-size: 14px;
          color: #666;
        }

        .order-items {
          margin-bottom: 12px;
        }

        .order-item-card {
          display: flex;
          align-items: flex-start;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid #e9ecef;
        }

        .order-item-card:last-child {
          margin-bottom: 0;
        }

        .item-image {
          width: 60px;
          height: 60px;
          margin-right: 12px;
          border-radius: 6px;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .item-color {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .item-quantity-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .item-quantity {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .item-price {
          font-size: 16px;
          font-weight: 600;
          color: #2E7D32;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .order-total {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .total-amount {
          color: #2E7D32;
        }

        .order-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 500;
        }

        .payment-status {
          font-size: 11px;
          font-weight: 500;
        }

        .order-actions {
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

        .action-button.confirm {
          background: #2196F3;
          color: white;
        }

        .action-button.ready {
          background: #9C27B0;
          color: white;
        }

        .action-button.complete {
          background: #4CAF50;
          color: white;
        }

        .action-button.whatsapp {
          background: #25D366;
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
