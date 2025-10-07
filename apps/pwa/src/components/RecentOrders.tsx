import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

interface RecentOrdersProps {
  isOffline: boolean;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ isOffline }) => {
  const { data: orders, isLoading } = useQuery(
    'recent-orders',
    async () => {
      const response = await fetch('/api/orders?limit=5');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    {
      retry: 3,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'ready':
        return '#9C27B0';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'ready':
        return '🚀';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
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

  if (isLoading) {
    return (
      <div className="recent-orders">
        <h3 className="section-title">Recent Orders</h3>
        <div className="orders-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="order-item loading">
              <div className="order-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-order-number"></div>
                  <div className="skeleton-status"></div>
                </div>
                <div className="skeleton-content">
                  <div className="skeleton-customer"></div>
                  <div className="skeleton-amount"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Smith',
      totalAmount: 150.00,
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      items: [
        { name: 'Coffee', quantity: 2 },
        { name: 'Sandwich', quantity: 1 },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Sarah Johnson',
      totalAmount: 85.50,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Tea', quantity: 1 },
        { name: 'Muffin', quantity: 2 },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Wilson',
      totalAmount: 200.00,
      status: 'completed',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Lunch Special', quantity: 1 },
        { name: 'Drink', quantity: 1 },
      ],
    },
  ];

  const displayOrders = orders || mockOrders;

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3 className="section-title">Recent Orders</h3>
        <button className="view-all-button">View All</button>
      </div>
      
      <div className="orders-list">
        {displayOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-text">
              <h4>No orders yet</h4>
              <p>Your recent orders will appear here</p>
            </div>
          </div>
        ) : (
          displayOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="order-item"
            >
              <div className="order-header">
                <div className="order-number">#{order.orderNumber}</div>
                <div 
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  <span className="status-text">{order.status}</span>
                </div>
              </div>
              
              <div className="order-content">
                <div className="customer-info">
                  <div className="customer-name">{order.customerName}</div>
                  <div className="order-time">{formatDate(order.createdAt)}</div>
                </div>
                
                <div className="order-details">
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="order-item-tag">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                  <div className="order-amount">R{order.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              
              {isOffline && (
                <div className="offline-indicator">
                  <span>📱</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .recent-orders {
          padding: 0 16px 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .view-all-button {
          background: none;
          border: none;
          color: #2E7D32;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .order-item {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .order-item.loading {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .order-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .skeleton-order-number {
          height: 16px;
          width: 80px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .skeleton-status {
          height: 16px;
          width: 60px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .skeleton-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .skeleton-customer {
          height: 14px;
          width: 100px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .skeleton-amount {
          height: 18px;
          width: 60px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .order-number {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .order-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-icon {
          font-size: 14px;
        }

        .order-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .customer-info {
          flex: 1;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .order-time {
          font-size: 12px;
          color: #666;
        }

        .order-details {
          text-align: right;
        }

        .order-items {
          margin-bottom: 8px;
        }

        .order-item-tag {
          display: inline-block;
          background: #f5f5f5;
          color: #666;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 4px;
          margin-bottom: 4px;
        }

        .order-amount {
          font-size: 16px;
          font-weight: 600;
          color: #2E7D32;
        }

        .offline-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 12px;
          opacity: 0.7;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-text h4 {
          font-size: 18px;
          color: #333;
          margin: 0 0 8px 0;
        }

        .empty-text p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      `}</style>
    </div>
  );
};
