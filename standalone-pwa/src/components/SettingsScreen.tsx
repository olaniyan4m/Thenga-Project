// ⚙️ Settings Management Screen
// Handles business settings, preferences, and configuration

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  whatsapp: boolean;
  currency: string;
  businessHours: string;
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storePhone: string;
  deliveryFee: number;
  minimumOrder: number;
  taxRate: number;
}

interface SettingsScreenProps {
  user: any;
  onLogout: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onNavigate?: (screen: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  onLogout, 
  settings, 
  onSettingsChange,
  onNavigate
}) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [showStorefront, setShowStorefront] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveSettings, setLiveSettings] = useState<any>(null);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  // Load live settings data
  useEffect(() => {
    const loadLiveSettings = async () => {
      setIsLoading(true);
      try {
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          const response = await fetch('/api/settings/business', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLiveSettings(data);
            // Update local settings with live data
            if (data.settings) {
              setCurrentSettings(prev => ({ ...prev, ...data.settings }));
            }
          }
        } else {
          // Development mode - use mock live data
          setLiveSettings({
            businessId: user?.id || 'demo_business',
            lastUpdated: new Date().toISOString(),
            syncStatus: 'synced',
            settings: {
              notifications: true,
              darkMode: false,
              whatsapp: true,
              currency: 'ZAR',
              businessHours: '08:00-18:00',
              storeName: user?.businessName || 'My Store',
              storeDescription: 'Welcome to our store',
              storeAddress: '',
              storePhone: user?.phone || '',
              deliveryFee: 25,
              minimumOrder: 50,
              taxRate: 15
            }
          });
        }
      } catch (error) {
        console.error('Failed to load live settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveSettings();
  }, [user]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const updatedSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const isProduction = process.env.NODE_ENV === 'production' || 
                           window.location.hostname !== 'localhost';
      
      if (isProduction) {
        // Save to live API
        const response = await fetch('/api/settings/business', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: user?.id,
            settings: currentSettings,
            updatedAt: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setLiveSettings(data);
          onSettingsChange(currentSettings);
          alert('Settings saved to live system successfully!');
        } else {
          throw new Error('Failed to save settings to API');
        }
      } else {
        // Development mode - save locally
        onSettingsChange(currentSettings);
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: Settings = {
        notifications: true,
        darkMode: false,
        whatsapp: true,
        currency: 'ZAR',
        businessHours: '08:00-18:00',
        storeName: user?.businessName || 'My Store',
        storeDescription: 'Welcome to our store',
        storeAddress: '',
        storePhone: user?.phone || '',
        deliveryFee: 25,
        minimumOrder: 50,
        taxRate: 15
      };
      setCurrentSettings(defaultSettings);
      onSettingsChange(defaultSettings);
    }
  };

  const generateStorefrontUrl = () => {
    const baseUrl = window.location.origin;
    const businessId = liveSettings?.businessId || user?.id || 'store_123';
    const storeUrl = `${baseUrl}/#customer?business=${businessId}`;
    return storeUrl;
  };

  const copyStorefrontUrl = () => {
    const url = generateStorefrontUrl();
    navigator.clipboard.writeText(url).then(() => {
      alert('Storefront URL copied to clipboard!');
    });
  };

  return (
    <div className="screen">
             <div className="screen-header">
               <div className="header-left">
                 <img src="/assets/Logo2.PNG" alt="Thenga Logo" className="header-logo" />
                 <h1>Settings</h1>
               </div>
               <div className="header-actions">
                 <button onClick={onLogout} className="logout-btn">Logout</button>
               </div>
             </div>
      
      <div className="screen-content">
        {/* Settings Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Business
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'storefront' ? 'active' : ''}`}
            onClick={() => setActiveTab('storefront')}
          >
            Storefront
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced Features
          </button>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3>General Preferences</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={currentSettings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
                <span className="checkmark"></span>
                Dark Mode
              </label>
              <p className="setting-description">Enable dark theme for the app</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={currentSettings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="checkmark"></span>
                Push Notifications
              </label>
              <p className="setting-description">Receive notifications for new orders and updates</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={currentSettings.whatsapp}
                  onChange={(e) => handleSettingChange('whatsapp', e.target.checked)}
                />
                <span className="checkmark"></span>
                WhatsApp Integration
              </label>
              <p className="setting-description">Enable WhatsApp messaging with customers</p>
            </div>

            <div className="setting-item">
              <label>Currency</label>
              <select
                value={currentSettings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        )}

        {/* Business Settings */}
        {activeTab === 'business' && (
          <div className="settings-section">
            <h3>Business Information</h3>
            
            <div className="setting-item">
              <label>Store Name</label>
              <input
                type="text"
                value={currentSettings.storeName}
                onChange={(e) => handleSettingChange('storeName', e.target.value)}
                placeholder="Enter your store name"
              />
            </div>

            <div className="setting-item">
              <label>Store Description</label>
              <textarea
                value={currentSettings.storeDescription}
                onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                placeholder="Describe your business"
                rows={3}
              />
            </div>

            <div className="setting-item">
              <label>Store Address</label>
              <input
                type="text"
                value={currentSettings.storeAddress}
                onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                placeholder="Enter your store address"
              />
            </div>

            <div className="setting-item">
              <label>Store Phone</label>
              <input
                type="tel"
                value={currentSettings.storePhone}
                onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="setting-item">
              <label>Business Hours</label>
              <input
                type="text"
                value={currentSettings.businessHours}
                onChange={(e) => handleSettingChange('businessHours', e.target.value)}
                placeholder="e.g., 08:00-18:00"
              />
            </div>

            <div className="setting-row">
              <div className="setting-item">
                <label>Delivery Fee (R)</label>
                <input
                  type="number"
                  value={currentSettings.deliveryFee}
                  onChange={(e) => handleSettingChange('deliveryFee', parseFloat(e.target.value) || 0)}
                  placeholder="25"
                />
              </div>
              <div className="setting-item">
                <label>Minimum Order (R)</label>
                <input
                  type="number"
                  value={currentSettings.minimumOrder}
                  onChange={(e) => handleSettingChange('minimumOrder', parseFloat(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="setting-item">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                value={currentSettings.taxRate}
                onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                placeholder="15"
              />
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={currentSettings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="checkmark"></span>
                New Order Notifications
              </label>
              <p className="setting-description">Get notified when new orders are placed</p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={currentSettings.whatsapp}
                  onChange={(e) => handleSettingChange('whatsapp', e.target.checked)}
                />
                <span className="checkmark"></span>
                WhatsApp Messages
              </label>
              <p className="setting-description">Receive WhatsApp messages from customers</p>
            </div>

            <div className="setting-item">
              <label>Notification Sound</label>
              <select>
                <option value="default">Default</option>
                <option value="chime">Chime</option>
                <option value="bell">Bell</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}

        {/* Storefront Settings */}
        {activeTab === 'storefront' && (
          <div className="settings-section">
            <h3>Storefront Configuration</h3>
            
            <div className="storefront-preview">
              <h4>Your Storefront URL</h4>
              <div className="url-display">
                <input
                  type="text"
                  value={generateStorefrontUrl()}
                  readOnly
                  className="url-input"
                />
                <button onClick={copyStorefrontUrl} className="copy-btn">
                  Copy URL
                </button>
              </div>
              <p className="url-description">
                Share this URL with your customers to let them browse and order from your store
              </p>
            </div>

            <div className="storefront-actions">
              <button 
                className="preview-btn"
                onClick={() => setShowStorefront(true)}
              >
                Preview Storefront
              </button>
              <button className="qr-btn">
                Generate QR Code
              </button>
            </div>

            <div className="storefront-settings">
              <h4>Storefront Settings</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                  />
                  <span className="checkmark"></span>
                  Enable Online Ordering
                </label>
                <p className="setting-description">Allow customers to place orders online</p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                  />
                  <span className="checkmark"></span>
                  Show Store Hours
                </label>
                <p className="setting-description">Display your business hours to customers</p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                  />
                  <span className="checkmark"></span>
                  Enable WhatsApp Chat
                </label>
                <p className="setting-description">Allow customers to chat with you via WhatsApp</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="settings-actions">
          <button 
            onClick={handleSaveSettings} 
            className="save-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button onClick={resetToDefaults} className="reset-btn">
            Reset to Defaults
          </button>
        </div>

        {/* Storefront Preview Modal */}
        {showStorefront && (
          <div className="modal-overlay">
            <div className="modal storefront-modal">
              <div className="modal-header">
                <h3>Storefront Preview</h3>
                <button onClick={() => setShowStorefront(false)} className="close-btn">×</button>
              </div>
              <div className="modal-content">
                <div className="storefront-preview-content">
                  <p>This is how your storefront will appear to customers:</p>
                  <div className="preview-frame">
                    <iframe
                      src={generateStorefrontUrl()}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      title="Storefront Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Features */}
        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h3>Advanced Features</h3>
            <p className="section-description">
              Access powerful business tools and integrations to grow your business.
            </p>

            <div className="advanced-features-grid">
              {/* Tax & SARS Compliance */}
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <div className="feature-content">
                  <h4>Tax & SARS Compliance</h4>
                  <p>Automated tax reporting and SARS compliance tools</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('tax')}
                  >
                    Open Tax Tools
                  </button>
                </div>
              </div>

              {/* Hardware Integrations */}
              <div className="feature-card">
                <div className="feature-icon">🖥️</div>
                <div className="feature-content">
                  <h4>Hardware Integrations</h4>
                  <p>Connect POS systems, printers, and payment terminals</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('hardware')}
                  >
                    Setup Hardware
                  </button>
                </div>
              </div>

              {/* Merchant Micro-lending */}
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <div className="feature-content">
                  <h4>Merchant Micro-lending</h4>
                  <p>Access business loans and credit facilities</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('lending')}
                  >
                    View Lending Options
                  </button>
                </div>
              </div>

              {/* Marketplace */}
              <div className="feature-card">
                <div className="feature-icon">🏪</div>
                <div className="feature-content">
                  <h4>Marketplace</h4>
                  <p>List products on online marketplaces</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('marketplace')}
                  >
                    Explore Marketplace
                  </button>
                </div>
              </div>

              {/* Loyalty & Coupons */}
              <div className="feature-card">
                <div className="feature-icon">🎁</div>
                <div className="feature-content">
                  <h4>Loyalty & Coupons</h4>
                  <p>Create customer loyalty programs and discount campaigns</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('loyalty')}
                  >
                    Setup Loyalty Program
                  </button>
                </div>
              </div>

              {/* Bookkeeping */}
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <div className="feature-content">
                  <h4>Bookkeeping & Accounting</h4>
                  <p>Advanced financial tracking and reporting</p>
                  <button 
                    className="feature-btn"
                    onClick={() => onNavigate?.('bookkeeping')}
                  >
                    Open Bookkeeping
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Status */}
            <div className="feature-status">
              <h4>Feature Status</h4>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Tax & SARS Compliance - Available</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Hardware Integrations - Available</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Merchant Micro-lending - Available</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Marketplace - Available</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Loyalty & Coupons - Available</span>
                </div>
                <div className="status-item">
                  <span className="status-icon">✅</span>
                  <span className="status-text">Bookkeeping - Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen;

