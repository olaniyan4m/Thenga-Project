// 💰 Pezela Subscription Plans Component
// Subscription plan selection after registration

import React, { useState } from 'react';
import PricingModelService from '../PricingModelSimple';
import PaymentProcessor from './PaymentProcessor';

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  onBack: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic_monthly');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const pricingService = PricingModelService;
  const subscriptionTiers = pricingService.getSubscriptionTiers();
  const addOnServices = pricingService.getAddOnServices();
  const setupFee = pricingService.getSetupFee();

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotalPrice = () => {
    const selectedTier = subscriptionTiers.find(tier => tier.id === selectedPlan);
    const selectedAddOnsList = addOnServices.filter(addOn => selectedAddOns.includes(addOn.id));
    
    const monthlyPrice = selectedTier?.price || 0;
    const addOnPrice = selectedAddOnsList.reduce((sum, addOn) => sum + addOn.price, 0);
    
    return {
      setupFee: setupFee.price,
      monthlyPrice: monthlyPrice + addOnPrice,
      totalFirstMonth: setupFee.price + monthlyPrice + addOnPrice
    };
  };

  const totalPrice = calculateTotalPrice();

  const handleProceedToPayment = () => {
    // Collect user data from form or use default values for demo
    setUserData({
      firstName: 'John', // In real app, get from registration form
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+27821234567',
    });
    setShowPayment(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('Payment successful:', transactionId);
    onSelectPlan(selectedPlan);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleBackToPlans = () => {
    setShowPayment(false);
  };

  // Show payment processor if payment is selected
  if (showPayment) {
    const selectedTier = subscriptionTiers.find(tier => tier.id === selectedPlan);
    if (selectedTier) {
      return (
        <PaymentProcessor
          userData={userData}
          subscriptionPlan={{
            id: selectedTier.id,
            name: selectedTier.name,
            price: selectedTier.price,
            description: selectedTier.description,
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
          onBack={handleBackToPlans}
        />
      );
    }
  }

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Registration
        </button>
        <h2>💰 Choose Your Pezela Plan</h2>
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
          {subscriptionTiers.map((tier) => (
            <div 
              key={tier.id} 
              className={`tier-card ${selectedPlan === tier.id ? 'selected' : ''} ${tier.isPopular ? 'popular' : ''}`}
              onClick={() => setSelectedPlan(tier.id)}
            >
              {tier.isPopular && <div className="popular-badge">Most Popular</div>}
              {tier.isRecommended && <div className="recommended-badge">Recommended</div>}
              
              <h4>{tier.name}</h4>
              <div className="tier-price">R{tier.price}/month</div>
              <p className="tier-description">{tier.description}</p>
              
              <ul className="tier-features">
                {tier.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
              
              <button 
                className={`select-button ${selectedPlan === tier.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(tier.id)}
              >
                {selectedPlan === tier.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add-on Services */}
      <div className="addon-services">
        <h3>🔧 Optional Add-on Services</h3>
        <div className="addons-grid">
          {addOnServices.map((addOn) => (
            <div 
              key={addOn.id} 
              className={`addon-card ${selectedAddOns.includes(addOn.id) ? 'selected' : ''}`}
              onClick={() => handleAddOnToggle(addOn.id)}
            >
              <div className="addon-header">
                <h4>{addOn.name}</h4>
                <div className="addon-price">R{addOn.price}/month</div>
              </div>
              <p className="addon-description">{addOn.description}</p>
              <ul className="addon-features">
                {addOn.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
              <div className="addon-toggle">
                <input 
                  type="checkbox" 
                  checked={selectedAddOns.includes(addOn.id)}
                  onChange={() => handleAddOnToggle(addOn.id)}
                />
                <span>Add to plan</span>
              </div>
            </div>
          ))}
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
            <span className="value">R{totalPrice.monthlyPrice}</span>
          </div>
          <div className="summary-row trial-note">
            <span className="label">Trial Period:</span>
            <span className="value">30 days free, then R{totalPrice.monthlyPrice}/month</span>
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
            <p>🔒 Your card will not be charged during the 30-day free trial. You'll be automatically charged R{totalPrice.monthlyPrice} after the trial period unless you cancel.</p>
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
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      </div>

      {/* Benefits Section */}
      <div className="plan-benefits">
        <h3>🎯 Why Choose Pezela?</h3>
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

export default SubscriptionPlans;
