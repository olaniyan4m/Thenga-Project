// 💰 Thenga Subscription Plans Component (Simplified)
// Subscription plan selection after registration

import React, { useState } from 'react';

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  onBack: () => void;
}

const SubscriptionPlansSimple: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic_monthly');

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Registration
        </button>
        <h2>💰 Choose Your Thenga Plan</h2>
        <p>Select the perfect plan for your business needs</p>
      </div>

      {/* Setup Fee Information */}
      <div className="setup-fee-info">
        <div className="setup-fee-card">
          <h3>🚀 Business Onboarding</h3>
          <div className="setup-price">FREE for new product launch</div>
          <p>Includes: WhatsApp setup, QR codes, training, and account configuration</p>
          <div className="trial-info">
            <span className="trial-badge">30 DAYS FREE TRIAL</span>
            <p>Credit card required for auto-renewal after trial</p>
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="subscription-tiers">
        <h3>📋 Monthly Subscription Plans</h3>
        <div className="tiers-grid">
          <div 
            className={`tier-card ${selectedPlan === 'basic_monthly' ? 'selected' : ''} recommended`}
            onClick={() => setSelectedPlan('basic_monthly')}
          >
            <div className="recommended-badge">Recommended</div>
            <h4>Basic Monthly</h4>
            <div className="tier-price">R199/month</div>
            <p className="tier-description">Essential features for small businesses - 30 DAYS FREE TRIAL</p>
            <ul className="tier-features">
              <li>✓ 30-day free trial (credit card required)</li>
              <li>✓ WhatsApp automation</li>
              <li>✓ QR code payments</li>
              <li>✓ Basic invoicing</li>
              <li>✓ Order management</li>
              <li>✓ Customer database</li>
              <li>✓ Basic analytics</li>
              <li>✓ Mobile app access</li>
            </ul>
            <button 
              className={`select-button ${selectedPlan === 'basic_monthly' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('basic_monthly')}
            >
              {selectedPlan === 'basic_monthly' ? 'Selected' : 'Select Plan'}
            </button>
          </div>

          <div 
            className={`tier-card ${selectedPlan === 'premium_monthly' ? 'selected' : ''} popular`}
            onClick={() => setSelectedPlan('premium_monthly')}
          >
            <div className="popular-badge">Most Popular</div>
            <h4>Premium Monthly</h4>
            <div className="tier-price">R399/month</div>
            <p className="tier-description">Advanced features for growing businesses - 30 DAYS FREE TRIAL</p>
            <ul className="tier-features">
              <li>✓ 30-day free trial (credit card required)</li>
              <li>✓ All Basic features</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Inventory management</li>
              <li>✓ Staff management</li>
              <li>✓ Multi-location support</li>
              <li>✓ Priority support</li>
              <li>✓ Custom branding</li>
            </ul>
            <button 
              className={`select-button ${selectedPlan === 'premium_monthly' ? 'selected' : ''}`}
              onClick={() => setSelectedPlan('premium_monthly')}
            >
              {selectedPlan === 'premium_monthly' ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="price-summary">
        <h3>💰 Price Summary</h3>
        <div className="summary-card">
          <div className="summary-row">
            <span className="label">Setup Fee (one-time):</span>
            <span className="value">FREE</span>
          </div>
          <div className="summary-row">
            <span className="label">First 30 Days:</span>
            <span className="value">FREE</span>
          </div>
          <div className="summary-row">
            <span className="label">After Trial (Monthly):</span>
            <span className="value">R{selectedPlan === 'basic_monthly' ? '199' : '399'}</span>
          </div>
          <div className="summary-row trial-note">
            <span className="label">Trial Period:</span>
            <span className="value">30 days free, then R{selectedPlan === 'basic_monthly' ? '199' : '399'}/month</span>
          </div>
        </div>
      </div>

      {/* Credit Card Collection */}
      <div className="credit-card-section">
        <h3>💳 Payment Information</h3>
        <div className="card-form">
          <div className="form-group">
            <label>Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" maxLength="19" />
          </div>
          <div className="card-details">
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="MM/YY" maxLength="5" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="text" placeholder="123" maxLength="4" />
            </div>
          </div>
          <div className="form-group">
            <label>Cardholder Name</label>
            <input type="text" placeholder="John Doe" />
          </div>
          <div className="trial-disclaimer">
            <p>🔒 Your card will not be charged during the 30-day free trial. You'll be automatically charged R{selectedPlan === 'basic_monthly' ? '199' : '399'} after the trial period unless you cancel.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="plan-actions">
        <button className="secondary-button" onClick={onBack}>
          Back to Registration
        </button>
        <button 
          className="primary-button"
          onClick={() => onSelectPlan(selectedPlan)}
        >
          Continue with {selectedPlan === 'basic_monthly' ? 'Basic' : 'Premium'} Plan
        </button>
      </div>

      {/* Benefits Section */}
      <div className="plan-benefits">
        <h3>🎯 Why Choose Thenga?</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="icon">🇿🇦</span>
            <div className="benefit-content">
              <h4>South African Focused</h4>
              <p>Built specifically for SA businesses with local payment gateways and SARS compliance</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="icon">📱</span>
            <div className="benefit-content">
              <h4>WhatsApp Integration</h4>
              <p>Your customers already use WhatsApp - now you can accept orders and payments through it</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="icon">⚡</span>
            <div className="benefit-content">
              <h4>Loadshedding Resilient</h4>
              <p>Works offline during power cuts and syncs when power returns</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="icon">🔒</span>
            <div className="benefit-content">
              <h4>Secure & Compliant</h4>
              <p>POPIA compliant data protection and PCI DSS secure payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansSimple;
