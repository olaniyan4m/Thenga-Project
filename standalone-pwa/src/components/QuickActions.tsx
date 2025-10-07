import React from 'react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'new_order',
      title: 'New Order',
      icon: '📝',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      description: 'Create a new order',
    },
    {
      id: 'add_product',
      title: 'Add Product',
      icon: '➕',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
      description: 'Add new product',
    },
    {
      id: 'view_orders',
      title: 'View Orders',
      icon: '📋',
      color: '#FF9800',
      bgColor: '#FFF3E0',
      description: 'See all orders',
    },
    {
      id: 'scan_qr',
      title: 'Scan QR',
      icon: '📱',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      description: 'Scan QR code',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      bgColor: '#E8F5E8',
      description: 'Send message',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📊',
      color: '#607D8B',
      bgColor: '#ECEFF1',
      description: 'View reports',
    },
  ];

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
  };

  return (
    <div className="quick-actions">
      <h3 className="section-title">Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(action.id)}
            className="action-button"
            style={{
              '--action-color': action.color,
              '--action-bg': action.bgColor,
            } as React.CSSProperties}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <style jsx>{`
        .quick-actions {
          padding: 0 16px 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 16px 0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .action-button {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          text-align: left;
          width: 100%;
        }

        .action-button:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: var(--action-color);
        }

        .action-button:active {
          transform: scale(0.98);
        }

        .action-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--action-bg);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          min-width: 0;
        }

        .action-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .action-description {
          font-size: 12px;
          color: #666;
          line-height: 1.3;
        }

        @media (max-width: 320px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 400px) {
          .actions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
