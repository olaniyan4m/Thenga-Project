import React from 'react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  };
  isLoading: boolean;
  isOffline: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
  isOffline,
}) => {
  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: '#2196F3',
      bgColor: '#E3F2FD',
    },
    {
      title: 'Total Revenue',
      value: `R${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: '#4CAF50',
      bgColor: '#E8F5E8',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: '#FF9800',
      bgColor: '#FFF3E0',
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: '✅',
      color: '#2E7D32',
      bgColor: '#E8F5E8',
    },
  ];

  if (isLoading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card loading">
              <div className="stat-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-value"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="stat-card"
            style={{
              '--stat-color': stat.color,
              '--stat-bg': stat.bgColor,
            } as React.CSSProperties}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            {isOffline && (
              <div className="offline-indicator">
                <span>📱</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .dashboard-stats {
          padding: 0 16px 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-card.loading {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .stat-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .skeleton-icon {
          width: 32px;
          height: 32px;
          background: #f0f0f0;
          border-radius: 8px;
        }

        .skeleton-content {
          flex: 1;
        }

        .skeleton-title {
          height: 12px;
          background: #f0f0f0;
          border-radius: 4px;
          margin-bottom: 8px;
          width: 60%;
        }

        .skeleton-value {
          height: 20px;
          background: #f0f0f0;
          border-radius: 4px;
          width: 40%;
        }

        .stat-card:not(.loading) {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 24px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--stat-bg);
          border-radius: 8px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: var(--stat-color);
        }

        .offline-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 12px;
          opacity: 0.7;
        }

        @media (max-width: 320px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
