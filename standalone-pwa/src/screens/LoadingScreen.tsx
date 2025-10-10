import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="phone-frame">
        <div className="phone-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="loading-container"
          >
            <div className="logo">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="logo-icon"
              >
                🚀
              </motion.div>
              <h1>Thenga</h1>
              <p>Loading your digital commerce platform...</p>
            </div>
            
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .loading-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }


        .loading-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .logo {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .logo h1 {
          font-size: 32px;
          font-weight: bold;
          color: #2E7D32;
          margin: 0 0 8px 0;
        }

        .logo p {
          font-size: 16px;
          color: #666;
          margin: 0;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2E7D32;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

      `}</style>
    </div>
  );
};
