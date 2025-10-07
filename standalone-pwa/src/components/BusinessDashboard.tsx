// 💰 Pezela Business Dashboard Component
// Business metrics and revenue projections dashboard

import React, { useState, useEffect } from 'react';
import PricingModelService from '../PricingModel';

interface BusinessDashboardProps {
  onNavigate?: (screen: string) => void;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ onNavigate }) => {
  const [selectedScenario, setSelectedScenario] = useState('month1');
  const [customClients, setCustomClients] = useState(50);
  const [bookkeepingClients, setBookkeepingClients] = useState(20);
  const [backupClients, setBackupClients] = useState(0);
  const [analyticsClients, setAnalyticsClients] = useState(0);

  const pricingService = PricingModelService;
  const revenueProjections = pricingService.getRevenueProjections();
  const pricingSummary = pricingService.getPricingSummary();
  const businessMetrics = pricingService.calculateBusinessMetrics();
  const revenueScenario = pricingService.getRevenueScenarioExample();

  const calculateCustomRevenue = () => {
    return pricingService.calculateRevenue(
      customClients,
      bookkeepingClients,
      backupClients,
      analyticsClients
    );
  };

  const customRevenue = calculateCustomRevenue();

  return (
    <div className="business-dashboard">
      <div className="dashboard-header">
        <h2>💰 Business Dashboard</h2>
        <p>Revenue projections and pricing model for Pezela</p>
      </div>

      {/* Pricing Summary */}
      <div className="pricing-summary">
        <h3>📊 Pricing Model</h3>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h4>Setup Fee</h4>
            <div className="price">R{pricingSummary.setupFee}</div>
            <p>One-time onboarding</p>
          </div>
          <div className="pricing-card">
            <h4>Monthly Subscription</h4>
            <div className="price">R{pricingSummary.monthlySubscription}</div>
            <p>Per business per month</p>
          </div>
          <div className="pricing-card">
            <h4>Bookkeeping Add-on</h4>
            <div className="price">R{pricingSummary.bookkeepingAddOn}</div>
            <p>Optional monthly</p>
          </div>
          <div className="pricing-card">
            <h4>Backup Add-on</h4>
            <div className="price">R{pricingSummary.backupAddOn}</div>
            <p>Optional monthly</p>
          </div>
        </div>
      </div>

      {/* Revenue Scenario Example */}
      <div className="revenue-scenario">
        <h3>📈 Revenue Scenario Example</h3>
        <div className="scenario-card">
          <h4>{revenueScenario.scenario}</h4>
          <div className="scenario-details">
            <div className="revenue-breakdown">
              <div className="revenue-item">
                <span className="label">Setup Fee Revenue:</span>
                <span className="value">R{revenueScenario.setupFeeRevenue.toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="label">Monthly Subscription:</span>
                <span className="value">R{revenueScenario.monthlySubscriptionRevenue.toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <span className="label">Add-on Revenue:</span>
                <span className="value">R{revenueScenario.addOnRevenue.toLocaleString()}</span>
              </div>
              <div className="revenue-item total">
                <span className="label">Total Revenue:</span>
                <span className="value">R{revenueScenario.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
            <p className="scenario-description">{revenueScenario.description}</p>
          </div>
        </div>
      </div>

      {/* Custom Revenue Calculator */}
      <div className="revenue-calculator">
        <h3>🧮 Custom Revenue Calculator</h3>
        <div className="calculator-form">
          <div className="form-group">
            <label>Number of Clients:</label>
            <input
              type="number"
              value={customClients}
              onChange={(e) => setCustomClients(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Bookkeeping Add-on Clients:</label>
            <input
              type="number"
              value={bookkeepingClients}
              onChange={(e) => setBookkeepingClients(parseInt(e.target.value) || 0)}
              min="0"
              max={customClients}
            />
          </div>
          <div className="form-group">
            <label>Backup Add-on Clients:</label>
            <input
              type="number"
              value={backupClients}
              onChange={(e) => setBackupClients(parseInt(e.target.value) || 0)}
              min="0"
              max={customClients}
            />
          </div>
          <div className="form-group">
            <label>Analytics Add-on Clients:</label>
            <input
              type="number"
              value={analyticsClients}
              onChange={(e) => setAnalyticsClients(parseInt(e.target.value) || 0)}
              min="0"
              max={customClients}
            />
          </div>
        </div>
        <div className="calculator-results">
          <div className="revenue-breakdown">
            <div className="revenue-item">
              <span className="label">Setup Fee Revenue:</span>
              <span className="value">R{customRevenue.setupFeeRevenue.toLocaleString()}</span>
            </div>
            <div className="revenue-item">
              <span className="label">Monthly Subscription:</span>
              <span className="value">R{customRevenue.monthlySubscriptionRevenue.toLocaleString()}</span>
            </div>
            <div className="revenue-item">
              <span className="label">Add-on Revenue:</span>
              <span className="value">R{customRevenue.addOnRevenue.toLocaleString()}</span>
            </div>
            <div className="revenue-item total">
              <span className="label">Total Revenue:</span>
              <span className="value">R{customRevenue.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="revenue-projections">
        <h3>📊 12-Month Revenue Projections</h3>
        <div className="projections-table">
          <div className="table-header">
            <div className="col">Month</div>
            <div className="col">New Clients</div>
            <div className="col">Total Clients</div>
            <div className="col">Monthly Revenue</div>
            <div className="col">Setup Revenue</div>
            <div className="col">Add-on Revenue</div>
            <div className="col">Total Revenue</div>
            <div className="col">Cumulative</div>
          </div>
          {revenueProjections.map((projection, index) => (
            <div key={index} className="table-row">
              <div className="col">{projection.month}</div>
              <div className="col">{projection.newClients}</div>
              <div className="col">{projection.totalClients}</div>
              <div className="col">R{projection.monthlySubscriptionRevenue.toLocaleString()}</div>
              <div className="col">R{projection.setupFeeRevenue.toLocaleString()}</div>
              <div className="col">R{projection.addOnRevenue.toLocaleString()}</div>
              <div className="col">R{projection.totalRevenue.toLocaleString()}</div>
              <div className="col">R{projection.cumulativeRevenue.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Metrics */}
      <div className="business-metrics">
        <h3>📈 Business Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Average Revenue Per User</h4>
            <div className="metric-value">R{businessMetrics.averageRevenuePerUser.toFixed(2)}</div>
          </div>
          <div className="metric-card">
            <h4>Customer Lifetime Value</h4>
            <div className="metric-value">R{businessMetrics.customerLifetimeValue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h4>Monthly Recurring Revenue</h4>
            <div className="metric-value">R{businessMetrics.monthlyRecurringRevenue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h4>Churn Rate</h4>
            <div className="metric-value">{(businessMetrics.churnRate * 100).toFixed(1)}%</div>
          </div>
          <div className="metric-card">
            <h4>Growth Rate</h4>
            <div className="metric-value">{(businessMetrics.growthRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Target Market */}
      <div className="target-market">
        <h3>🎯 Target Market</h3>
        <div className="market-sections">
          <div className="market-section">
            <h4>Primary Target</h4>
            <ul>
              <li>Spaza shops and corner stores</li>
              <li>Food vendors and street food</li>
              <li>Hair salons and barbershops</li>
              <li>Small retail stores</li>
              <li>Service providers</li>
              <li>Informal traders</li>
            </ul>
          </div>
          <div className="market-section">
            <h4>Secondary Target</h4>
            <ul>
              <li>Medium-sized retail businesses</li>
              <li>Restaurants and cafes</li>
              <li>Beauty and wellness services</li>
              <li>Professional services</li>
              <li>Community organizations</li>
              <li>NGOs and non-profits</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="competitive-advantages">
        <h3>🏆 Competitive Advantages</h3>
        <div className="advantages-grid">
          <div className="advantage-item">
            <span className="icon">🇿🇦</span>
            <span className="text">South African focused pricing (ZAR)</span>
          </div>
          <div className="advantage-item">
            <span className="icon">📱</span>
            <span className="text">WhatsApp integration (familiar to SA businesses)</span>
          </div>
          <div className="advantage-item">
            <span className="icon">⚡</span>
            <span className="text">Offline-first design (loadshedding resilient)</span>
          </div>
          <div className="advantage-item">
            <span className="icon">💳</span>
            <span className="text">Local payment gateways (PayFast, Yoco)</span>
          </div>
          <div className="advantage-item">
            <span className="icon">📊</span>
            <span className="text">SARS compliance built-in</span>
          </div>
          <div className="advantage-item">
            <span className="icon">🔒</span>
            <span className="text">POPIA compliant data protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
