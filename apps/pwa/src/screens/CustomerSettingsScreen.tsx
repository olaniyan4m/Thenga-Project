import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { OfflineIndicator } from '../components/OfflineIndicator';

export const CustomerSettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    pushNotifications: true,
    language: 'en',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="customer-settings-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="settings-container"
      >
        {/* Header */}
        <div className="settings-header">
          <h1>⚙️ Account Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-icon">👤</div>
            </div>
            <div className="profile-info">
              <h3>{user?.name || 'Customer'}</h3>
              <p>{user?.email || 'customer@example.com'}</p>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email Notifications</h3>
              <p>Receive updates via email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Push Notifications</h3>
              <p>Receive push notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* App Settings */}
        <div className="settings-section">
          <h2>App Preferences</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Dark Mode</h3>
              <p>Switch to dark theme</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Language</h3>
              <p>Select your preferred language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
            </select>
          </div>
        </div>

        {/* Support Section */}
        <div className="settings-section">
          <h2>Support & Help</h2>
          <div className="support-options">
            <button className="support-btn">
              <div className="support-icon">📞</div>
              <div className="support-text">
                <h3>Contact Support</h3>
                <p>Get help with your account</p>
              </div>
            </button>
            
            <button className="support-btn">
              <div className="support-icon">❓</div>
              <div className="support-text">
                <h3>FAQ</h3>
                <p>Frequently asked questions</p>
              </div>
            </button>
            
            <button className="support-btn">
              <div className="support-icon">📋</div>
              <div className="support-text">
                <h3>Terms & Conditions</h3>
                <p>Read our terms of service</p>
              </div>
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="settings-section">
          <button className="logout-btn" onClick={handleLogout}>
            <div className="logout-icon">🚪</div>
            <div className="logout-text">
              <h3>Sign Out</h3>
              <p>Sign out of your account</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
