import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import toast from 'react-hot-toast';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    sms: false,
    email: true,
    push: true,
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessName: user?.merchant?.businessName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleSaveSettings = () => {
    // Save settings logic
    toast.success('Settings saved successfully');
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="settings-screen">
      <div className="phone-frame">
        <div className="phone-screen">
          {/* Header */}
          <div className="screen-header">
            <h1>Settings</h1>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* Profile Section */}
            <div className="settings-section">
              <h3 className="section-title">Profile</h3>
              <div className="profile-card">
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-role">{user?.role}</div>
                  <div className="profile-business">{user?.merchant?.businessName}</div>
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="settings-section">
              <h3 className="section-title">Business Information</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    value={businessSettings.businessName}
                    onChange={(e) => setBusinessSettings(prev => ({
                      ...prev,
                      businessName: e.target.value,
                    }))}
                  />
                </div>
                
                <div className="setting-item">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings(prev => ({
                      ...prev,
                      phone: e.target.value,
                    }))}
                  />
                </div>
                
                <div className="setting-item">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings(prev => ({
                      ...prev,
                      email: e.target.value,
                    }))}
                  />
                </div>
                
                <div className="setting-item">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    value={businessSettings.address}
                    onChange={(e) => setBusinessSettings(prev => ({
                      ...prev,
                      address: e.target.value,
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-section">
              <h3 className="section-title">Notifications</h3>
              <div className="settings-group">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="setting-item toggle">
                    <div className="setting-label">
                      <span className="setting-icon">
                        {key === 'whatsapp' && '💬'}
                        {key === 'sms' && '📱'}
                        {key === 'email' && '📧'}
                        {key === 'push' && '🔔'}
                      </span>
                      <span className="setting-text">
                        {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                      </span>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      className={`toggle-button ${value ? 'active' : ''}`}
                    >
                      <div className="toggle-slider"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Settings */}
            <div className="settings-section">
              <h3 className="section-title">Payment Settings</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <span className="setting-icon">💳</span>
                    <span className="setting-text">Payment Methods</span>
                  </div>
                  <button className="action-button">Configure</button>
                </div>
                
                <div className="setting-item">
                  <div className="setting-label">
                    <span className="setting-icon">🏦</span>
                    <span className="setting-text">Bank Details</span>
                  </div>
                  <button className="action-button">Update</button>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div className="settings-section">
              <h3 className="section-title">App Settings</h3>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-label">
                    <span className="setting-icon">🌙</span>
                    <span className="setting-text">Dark Mode</span>
                  </div>
                  <button className="toggle-button">
                    <div className="toggle-slider"></div>
                  </button>
                </div>
                
                <div className="setting-item">
                  <div className="setting-label">
                    <span className="setting-icon">🔒</span>
                    <span className="setting-text">Privacy Settings</span>
                  </div>
                  <button className="action-button">Manage</button>
                </div>
              </div>
            </div>

            {/* Offline Status */}
            {!isOnline && (
              <div className="offline-notice">
                <div className="offline-content">
                  <span className="offline-icon">📱</span>
                  <div className="offline-text">
                    <div className="offline-title">Offline Mode</div>
                    <div className="offline-description">
                      Your settings will sync when you're back online
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="settings-actions">
              <button
                onClick={handleSaveSettings}
                className="save-button"
              >
                Save Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-screen {
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

        .settings-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 12px 0;
        }

        .profile-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          background: #2E7D32;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: bold;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .profile-role {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .profile-business {
          font-size: 14px;
          color: #2E7D32;
          font-weight: 500;
        }

        .settings-group {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .setting-item {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-item.toggle {
          justify-content: space-between;
        }

        .setting-item label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
          display: block;
        }

        .setting-item input,
        .setting-item textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .setting-item input:focus,
        .setting-item textarea:focus {
          outline: none;
          border-color: #2E7D32;
        }

        .setting-label {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .setting-icon {
          font-size: 18px;
        }

        .setting-text {
          font-size: 14px;
          color: #333;
        }

        .toggle-button {
          width: 44px;
          height: 24px;
          background: #e0e0e0;
          border: none;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .toggle-button.active {
          background: #2E7D32;
        }

        .toggle-slider {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-button.active .toggle-slider {
          transform: translateX(20px);
        }

        .action-button {
          background: #2196F3;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .offline-notice {
          background: #FFF3CD;
          border: 1px solid #FFC107;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .offline-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .offline-icon {
          font-size: 16px;
        }

        .offline-title {
          font-size: 14px;
          font-weight: 600;
          color: #856404;
        }

        .offline-description {
          font-size: 12px;
          color: #856404;
        }

        .settings-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .save-button,
        .logout-button {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .save-button {
          background: #2E7D32;
          color: white;
        }

        .logout-button {
          background: #f44336;
          color: white;
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
