import React, { useState } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    color?: string;
    variant?: string;
  }>;
  createdAt: string;
  notes?: string;
}

interface OrdersScreenProps {
  user: any;
  onLogout: () => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  sendOrderConfirmation: (order: Order) => void;
  sendOrderReady: (order: Order) => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ 
  user, 
  onLogout, 
  orders, 
  updateOrderStatus, 
  sendOrderConfirmation, 
  sendOrderReady 
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#FF6B35',
      confirmed: '#4ECDC4', 
      preparing: '#45B7D1',
      ready: '#96CEB4',
      completed: '#6BCF7F',
      cancelled: '#FF8A80'
    };
    return colors[status as keyof typeof colors] || '#666';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '🕐',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '🚀',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[status as keyof typeof icons] || '📦';
  };

  const filteredOrders = orders.filter(order => 
    activeTab === 'all' || order.status === activeTab
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Show user-friendly error message
      alert('Failed to update order status. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-left">
          <img src="/assets/Logo2.PNG" alt="Thenga Logo" className="header-logo" />
          <h1>Orders ({orders.length})</h1>
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="new-orders-page">
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-number pending">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-item">
            <div className="stat-number preparing">{stats.preparing}</div>
            <div className="stat-label">Preparing</div>
          </div>
          <div className="stat-item">
            <div className="stat-number ready">{stats.ready}</div>
            <div className="stat-label">Ready</div>
          </div>
          <div className="stat-item">
            <div className="stat-number completed">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={`tab ${activeTab === 'preparing' ? 'active' : ''}`}
              onClick={() => setActiveTab('preparing')}
            >
              Preparing ({stats.preparing})
            </button>
            <button 
              className={`tab ${activeTab === 'ready' ? 'active' : ''}`}
              onClick={() => setActiveTab('ready')}
            >
              Ready ({stats.ready})
            </button>
            <button 
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({stats.completed})
            </button>
          </div>
        </div>

        <div className="orders-container">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card-new">
                  <div className="order-header-new">
                    <div className="order-number">#{order.orderNumber}</div>
                    <div className="order-time">{formatTime(order.createdAt)}</div>
                  </div>

                  <div className="order-status-new">
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      <span className="status-text">{order.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="customer-section">
                    <div className="customer-name">{order.customerName}</div>
                    <div className="customer-phone">{order.customerPhone}</div>
                  </div>

                  <div className="order-items-new">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-info">
                          <span className="item-quantity">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                        </div>
                        <span className="item-price">R{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="order-notes-new">
                      <span className="notes-label">Notes:</span>
                      <span className="notes-text">{order.notes}</span>
                    </div>
                  )}

                  <div className="order-total-new">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">R{order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="order-actions-new">
                    {order.status === 'pending' && (
                      <button 
                        className="action-btn-new confirm"
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        className="action-btn-new preparing"
                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      >
                        Start Cooking
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        className="action-btn-new ready"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button 
                        className="action-btn-new complete"
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      className="action-btn-new whatsapp"
                      onClick={() => window.open(`https://wa.me/${order.customerPhone.replace('+', '')}?text=Hello ${order.customerName}, your order #${order.orderNumber} is ${order.status}. Thank you!`)}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersScreen;