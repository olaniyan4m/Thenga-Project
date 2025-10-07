import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const CustomerBottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Home',
      activeIcon: '🏠',
    },
    {
      path: '/products',
      icon: '🛍️',
      label: 'Shop',
      activeIcon: '🛍️',
    },
    {
      path: '/orders',
      icon: '📋',
      label: 'Orders',
      activeIcon: '📋',
    },
    {
      path: '/payments',
      icon: '💳',
      label: 'Payments',
      activeIcon: '💳',
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Account',
      activeIcon: '⚙️',
    },
  ];

  return (
    <div className="customer-bottom-navigation">
      <div className="nav-container">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="nav-content"
              >
                <div className="nav-icon">
                  {isActive ? item.activeIcon : item.icon}
                </div>
                <div className="nav-label">{item.label}</div>
              </motion.div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="active-indicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .customer-bottom-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e0e0e0;
          z-index: 100;
          padding: 8px 0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 375px;
          margin: 0 auto;
          padding: 0 8px;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #666;
          transition: color 0.2s;
          position: relative;
          padding: 8px 4px;
          border-radius: 8px;
        }

        .nav-item.active {
          color: #2E7D32;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .nav-icon {
          font-size: 20px;
          transition: transform 0.2s;
        }

        .nav-item.active .nav-icon {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 10px;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
        }

        .active-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #2E7D32;
          border-radius: 0 0 3px 3px;
        }

        @media (max-width: 400px) {
          .customer-bottom-navigation {
            padding: 6px 0;
          }

          .nav-item {
            padding: 6px 2px;
          }

          .nav-icon {
            font-size: 18px;
          }

          .nav-label {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};
