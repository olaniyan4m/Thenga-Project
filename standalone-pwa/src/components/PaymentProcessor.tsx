// 💳 PayFast Payment Processor Component
// Handles payment processing for Pezela subscriptions

import React, { useState, useEffect } from 'react';
import PayFastService from '../services/PayFastService';

interface PaymentProcessorProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  subscriptionPlan: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentCancel: () => void;
  onBack: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  userData,
  subscriptionPlan,
  onPaymentSuccess,
  onPaymentCancel,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Test PayFast connection on component mount
    testPayFastConnection();
  }, []);

  const testPayFastConnection = async () => {
    try {
      const result = await PayFastService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
    } catch (error) {
      setConnectionStatus('failed');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await PayFastService.createPayment({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        amount: subscriptionPlan.price,
        itemName: `Pezela ${subscriptionPlan.name}`,
        itemDescription: subscriptionPlan.description,
        customData: {
          userId: userData.email, // Using email as user ID for now
          planId: subscriptionPlan.id,
          subscriptionType: 'monthly',
        },
      });

      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        // Redirect to PayFast
        window.location.href = result.paymentUrl;
      } else {
        setError(result.error || 'Payment creation failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    onPaymentCancel();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="payment-processor">
      <div className="payment-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Plans
        </button>
        <h2>💳 Complete Your Payment</h2>
        <p>Secure payment processing with PayFast</p>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <div className={`status-indicator ${connectionStatus}`}>
          {connectionStatus === 'checking' && (
            <>
              <span className="status-icon">🔄</span>
              <span>Checking PayFast connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <span className="status-icon">✅</span>
              <span>PayFast connected successfully</span>
            </>
          )}
          {connectionStatus === 'failed' && (
            <>
              <span className="status-icon">❌</span>
              <span>PayFast connection failed</span>
            </>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="payment-summary">
        <h3>📋 Payment Summary</h3>
        <div className="summary-card">
          <div className="summary-row">
            <span className="label">Plan:</span>
            <span className="value">{subscriptionPlan.name}</span>
          </div>
          <div className="summary-row">
            <span className="label">Description:</span>
            <span className="value">{subscriptionPlan.description}</span>
          </div>
          <div className="summary-row">
            <span className="label">Amount:</span>
            <span className="value">R{subscriptionPlan.price}</span>
          </div>
          <div className="summary-row">
            <span className="label">Billing:</span>
            <span className="value">Monthly (after 30-day free trial)</span>
          </div>
          <div className="summary-row total">
            <span className="label">Total:</span>
            <span className="value">R{subscriptionPlan.price}/month</span>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="user-info">
        <h3>👤 Account Information</h3>
        <div className="info-card">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{userData.firstName} {userData.lastName}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{userData.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Phone:</span>
            <span className="value">{userData.phone}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="payment-method">
        <h3>💳 Payment Method</h3>
        <div className="payment-method-card">
          <div className="payment-provider">
            <span className="provider-icon">🏦</span>
            <div className="provider-info">
              <h4>PayFast</h4>
              <p>Secure payment processing in South Africa</p>
              <div className="provider-features">
                <span className="feature">✓ Credit/Debit Cards</span>
                <span className="feature">✓ EFT</span>
                <span className="feature">✓ Instant EFT</span>
                <span className="feature">✓ Mobile Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Information */}
      <div className="trial-info">
        <div className="trial-card">
          <h4>🎉 30-Day Free Trial</h4>
          <p>Your card will not be charged during the trial period. You'll be automatically charged R{subscriptionPlan.price} after 30 days unless you cancel.</p>
          <div className="trial-features">
            <span className="feature">✓ Full access to all features</span>
            <span className="feature">✓ No setup fees</span>
            <span className="feature">✓ Cancel anytime</span>
            <span className="feature">✓ 24/7 support</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="payment-actions">
        <button 
          className="secondary-button" 
          onClick={handleBack}
          disabled={isProcessing}
        >
          Back to Plans
        </button>
        <button 
          className="primary-button" 
          onClick={handlePayment}
          disabled={isProcessing || connectionStatus !== 'connected'}
        >
          {isProcessing ? 'Processing...' : `Pay R${subscriptionPlan.price} with PayFast`}
        </button>
      </div>

      {/* Security Information */}
      <div className="security-info">
        <h4>🔒 Security & Compliance</h4>
        <div className="security-features">
          <div className="security-item">
            <span className="security-icon">🛡️</span>
            <span>PCI DSS Compliant</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🔐</span>
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🏦</span>
            <span>Bank-level Security</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🇿🇦</span>
            <span>South African Regulated</span>
          </div>
        </div>
      </div>

      {/* Payment URL Display (for debugging) */}
      {paymentUrl && (
        <div className="payment-url-debug">
          <h4>Payment URL (Debug)</h4>
          <p className="url-text">{paymentUrl}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessor;
