import React from 'react';
import { motion } from 'framer-motion';

export const OfflineIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="offline-indicator"
    >
      <div className="offline-content">
        <div className="offline-icon">📱</div>
        <div className="offline-text">
          <div className="offline-title">You're Offline</div>
          <div className="offline-description">
            Your data is being saved locally and will sync when you're back online
          </div>
        </div>
      </div>

      <style jsx>{`
        .offline-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #FFF3CD;
          border-bottom: 1px solid #FFC107;
          padding: 12px 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .offline-content {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 375px;
          margin: 0 auto;
        }

        .offline-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .offline-text {
          flex: 1;
        }

        .offline-title {
          font-size: 14px;
          font-weight: 600;
          color: #856404;
          margin-bottom: 2px;
        }

        .offline-description {
          font-size: 12px;
          color: #856404;
          line-height: 1.4;
        }

        @media (max-width: 400px) {
          .offline-indicator {
            padding: 12px 16px;
          }
        }
      `}</style>
    </motion.div>
  );
};
