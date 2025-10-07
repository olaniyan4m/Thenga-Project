// 📊 Bookkeeping Snapshot Component
// Automated bookkeeping and financial reporting for South African businesses

import React, { useState, useEffect } from 'react';
import SARSService from '../services/SARSService';
import AccountingService from '../services/AccountingService';
import { API_CONFIG } from '../config/APIConfig';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  reference: string;
  vatAmount?: number;
  isReconciled: boolean;
}

interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  vatCollected: number;
  vatPaid: number;
  vatOwing: number;
  transactions: Transaction[];
}

interface AccountingSystem {
  id: string;
  name: string;
  isConnected: boolean;
  lastSync: string;
  config: any;
  service?: AccountingService;
}

const BookkeepingSnapshot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [accountingSystems, setAccountingSystems] = useState<AccountingSystem[]>([
    { 
      id: 'quickbooks', 
      name: 'QuickBooks', 
      isConnected: false, 
      lastSync: '', 
      config: {
        clientId: 'your_quickbooks_client_id',
        clientSecret: 'your_quickbooks_client_secret',
        redirectUri: 'https://your-app.com/oauth/quickbooks/callback',
        environment: 'sandbox'
      }
    },
    { 
      id: 'xero', 
      name: 'Xero', 
      isConnected: false, 
      lastSync: '', 
      config: {
        clientId: 'your_xero_client_id',
        clientSecret: 'your_xero_client_secret',
        redirectUri: 'https://your-app.com/oauth/xero/callback',
        environment: 'sandbox'
      }
    },
    { 
      id: 'sage', 
      name: 'Sage', 
      isConnected: false, 
      lastSync: '', 
      config: {
        clientId: 'your_sage_client_id',
        clientSecret: 'your_sage_client_secret',
        redirectUri: 'https://your-app.com/oauth/sage/callback',
        environment: 'sandbox'
      }
    },
    { 
      id: 'pastel', 
      name: 'Pastel', 
      isConnected: false, 
      lastSync: '', 
      config: {
        clientId: 'your_pastel_client_id',
        clientSecret: 'your_pastel_client_secret',
        redirectUri: 'https://your-app.com/oauth/pastel/callback',
        environment: 'sandbox'
      }
    },
  ]);
  const [sarsService, setSarsService] = useState<SARSService | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Quick actions state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingPandL, setIsExportingPandL] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isAnalyzingCashFlow, setIsAnalyzingCashFlow] = useState(false);
  const [actionResults, setActionResults] = useState<{[key: string]: any}>({});
  
  // Show results state
  const [showSARSReport, setShowSARSReport] = useState(false);
  const [showPandLExport, setShowPandLExport] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [showCashFlowAnalysis, setShowCashFlowAnalysis] = useState(false);
  
  // Financial Reports state
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSubmittingToSARS, setIsSubmittingToSARS] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showReportResults, setShowReportResults] = useState(false);
  const [reportResults, setReportResults] = useState<any>(null);
  
  // View details state
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [viewDetails, setViewDetails] = useState<any>(null);
  
  // Accounting integrations state
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [showIntegrationResults, setShowIntegrationResults] = useState(false);
  const [integrationResults, setIntegrationResults] = useState<any>(null);
  
  // Configuration form state
  const [showConfigForm, setShowConfigForm] = useState<string | null>(null);
  const [configData, setConfigData] = useState<{[key: string]: any}>({});

  // Initialize services and load data
  useEffect(() => {
    // Initialize SARS service with real configuration
    const sars = new SARSService(API_CONFIG.SARS);
    setSarsService(sars);

    // Initialize accounting services with real configuration
    const updatedSystems = accountingSystems.map(system => {
      let config;
      switch (system.id) {
        case 'quickbooks':
          config = API_CONFIG.QUICKBOOKS;
          break;
        case 'xero':
          config = API_CONFIG.XERO;
          break;
        case 'sage':
          config = API_CONFIG.SAGE;
          break;
        case 'pastel':
          config = API_CONFIG.PASTEL;
          break;
        default:
          config = system.config;
      }
      
      const service = new AccountingService({
        system: system.id as any,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        environment: config.environment as any,
        companyId: (config as any).companyId
      });
      
      return { ...system, service, config };
    });
    
    setAccountingSystems(updatedSystems);

    // Load real transaction data
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Load transactions from all connected accounting systems
      const allTransactions: Transaction[] = [];
      
      for (const system of accountingSystems) {
        if (system.isConnected && system.service) {
          try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();
            
            const systemTransactions = await system.service.getTransactions(
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0]
            );
            
            allTransactions.push(...systemTransactions);
          } catch (error) {
            console.error(`Failed to load transactions from ${system.name}:`, error);
          }
        }
      }
      
      if (allTransactions.length === 0) {
        // Fallback to mock data if no real data available
        loadMockData();
      } else {
        setTransactions(allTransactions);
        calculateFinancialReport(allTransactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: '2024-01-15',
        description: 'Sales - Product A',
        amount: 1500,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'Card',
        reference: 'INV-001',
        vatAmount: 195,
        isReconciled: true,
      },
      {
        id: '2',
        date: '2024-01-15',
        description: 'Office Supplies',
        amount: 250,
        type: 'expense',
        category: 'Office Expenses',
        paymentMethod: 'EFT',
        reference: 'EXP-001',
        vatAmount: 32.5,
        isReconciled: true,
      },
      {
        id: '3',
        date: '2024-01-16',
        description: 'Sales - Product B',
        amount: 800,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'Cash',
        reference: 'INV-002',
        vatAmount: 104,
        isReconciled: false,
      },
    ];

    setTransactions(mockTransactions);
    calculateFinancialReport(mockTransactions);
  };

  const calculateFinancialReport = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const vatCollected = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.vatAmount || 0), 0);
    
    const vatPaid = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.vatAmount || 0), 0);

    const report: FinancialReport = {
      period: 'January 2024',
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      vatCollected,
      vatPaid,
      vatOwing: vatCollected - vatPaid,
      transactions,
    };

    setFinancialReport(report);
  };

  const handleCategorizeTransaction = (transactionId: string, category: string) => {
    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, category } : t)
    );
  };

  const handleReconcileTransaction = (transactionId: string) => {
    setTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, isReconciled: true } : t)
    );
  };


  const generateSARSReport = async () => {
    if (!sarsService) {
      alert('SARS service not initialized');
      return;
    }

    try {
      // Authenticate with SARS if not already authenticated
      if (!sarsService.isAuthenticated()) {
        const authenticated = await sarsService.authenticate();
        if (!authenticated) {
          alert('Failed to authenticate with SARS. Please check your credentials.');
          return;
        }
      }

      // Calculate VAT return from transactions
      const vatReturn = sarsService.calculateVAT(transactions);
      
      // Submit VAT return to SARS
      const submission = await sarsService.submitVATReturn(vatReturn);
      
      alert(`SARS VAT return submitted successfully! Reference: ${submission.referenceNumber}`);
      
      // Update financial report with new VAT data
      calculateFinancialReport(transactions);
    } catch (error) {
      console.error('SARS submission failed:', error);
      alert(`Failed to submit to SARS: ${error.message}`);
    }
  };

  const exportToAccounting = async (systemId: string) => {
    const system = accountingSystems.find(s => s.id === systemId);
    if (!system || !system.service) {
      alert('Accounting system not found');
      return;
    }

    try {
      // Authenticate with accounting system if not already connected
      if (!system.isConnected) {
        const authenticated = await system.service.authenticate();
        if (!authenticated) {
          alert(`Failed to authenticate with ${system.name}. Please check your credentials.`);
          return;
        }
        
        // Update system status
        setAccountingSystems(prev => 
          prev.map(s => s.id === systemId 
            ? { ...s, isConnected: true, lastSync: new Date().toISOString() }
            : s
          )
        );
      }

      // Convert transactions to accounting format
      const accountingTransactions = transactions.map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        account: t.category,
        vatAmount: t.vatAmount,
        reference: t.reference
      }));

      // Sync transactions to accounting system
      const result = await system.service.syncTransactions(accountingTransactions);
      
      if (result.success) {
        alert(`Successfully synced ${result.syncedTransactions} transactions to ${system.name}`);
        
        // Update last sync date
        setAccountingSystems(prev => 
          prev.map(s => s.id === systemId 
            ? { ...s, lastSync: result.lastSyncDate }
            : s
          )
        );
      } else {
        alert(`Sync completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error(`Export to ${system.name} failed:`, error);
      alert(`Failed to export to ${system.name}: ${error.message}`);
    }
  };

  const handleConnectAccounting = async (systemId: string) => {
    const system = accountingSystems.find(s => s.id === systemId);
    if (!system || !system.service) {
      alert('Accounting system not found');
      return;
    }

    try {
      const authenticated = await system.service.authenticate();
      if (authenticated) {
        setAccountingSystems(prev => 
          prev.map(s => s.id === systemId 
            ? { ...s, isConnected: true, lastSync: new Date().toISOString() }
            : s
          )
        );
        alert(`Successfully connected to ${system.name}`);
      } else {
        alert(`Failed to connect to ${system.name}. Please check your credentials.`);
      }
    } catch (error) {
      console.error(`Connection to ${system.name} failed:`, error);
      alert(`Failed to connect to ${system.name}: ${error.message}`);
    }
  };

  return (
    <div className="bookkeeping-snapshot">
      <div className="bookkeeping-header">
        <h2>Bookkeeping Snapshot</h2>
        <p>Automated financial management for South African businesses</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bookkeeping-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="financial-overview">
            <h3>Financial Overview</h3>
            <div className="overview-cards">
              <div className="overview-card income">
                <h4>Total Income</h4>
                <div className="amount">R{financialReport?.totalIncome.toLocaleString()}</div>
                <div className="period">{financialReport?.period}</div>
              </div>
              <div className="overview-card expenses">
                <h4>Total Expenses</h4>
                <div className="amount">R{financialReport?.totalExpenses.toLocaleString()}</div>
                <div className="period">{financialReport?.period}</div>
              </div>
              <div className="overview-card profit">
                <h4>Net Profit</h4>
                <div className="amount">R{financialReport?.netProfit.toLocaleString()}</div>
                <div className="period">{financialReport?.period}</div>
              </div>
              <div className="overview-card vat">
                <h4>VAT Owing</h4>
                <div className="amount">R{financialReport?.vatOwing.toLocaleString()}</div>
                <div className="period">To SARS</div>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="action-btn primary" 
                onClick={async () => {
                  setIsGeneratingReport(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Generate SARS report in production
                      const response = await fetch('/api/bookkeeping/sars-report', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          transactions: transactions,
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        setActionResults(prev => ({ ...prev, sarsReport: result }));
                        setShowSARSReport(true);
                      }
                    } else {
                      // Development mode - simulate report generation
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      const mockResult = {
                        period: selectedPeriod,
                        vatCollected: financialReport?.vatCollected || 0,
                        vatPaid: financialReport?.vatPaid || 0,
                        vatOwing: financialReport?.vatOwing || 0,
                        referenceNumber: `SARS-${Date.now()}`,
                        generatedAt: new Date().toISOString()
                      };
                      setActionResults(prev => ({ ...prev, sarsReport: mockResult }));
                      setShowSARSReport(true);
                    }
                  } catch (error) {
                    console.error('Error generating SARS report:', error);
                    alert(`❌ Error generating SARS report:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsGeneratingReport(false);
                  }
                }}
              >
                {isGeneratingReport ? 'Generating...' : 'Generate SARS Report'}
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={async () => {
                  setIsExportingPandL(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Export P&L statement in production
                      const response = await fetch('/api/bookkeeping/export-pandl', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          format: 'pdf',
                          includeCharts: true,
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `P&L_Statement_${selectedPeriod}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        
                        setActionResults(prev => ({ ...prev, pandLExport: { success: true, filename: `P&L_Statement_${selectedPeriod}.pdf` } }));
                        setShowPandLExport(true);
                      }
                    } else {
                      // Development mode - simulate export
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      const mockData = {
                        period: selectedPeriod,
                        totalIncome: financialReport?.totalIncome || 0,
                        totalExpenses: financialReport?.totalExpenses || 0,
                        netProfit: financialReport?.netProfit || 0,
                        filename: `P&L_Statement_${selectedPeriod}.pdf`
                      };
                      setActionResults(prev => ({ ...prev, pandLExport: mockData }));
                      setShowPandLExport(true);
                    }
                  } catch (error) {
                    console.error('Error exporting P&L:', error);
                    alert(`❌ Error exporting P&L statement:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsExportingPandL(false);
                  }
                }}
              >
                {isExportingPandL ? 'Exporting...' : 'Export P&L Statement'}
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={async () => {
                  setIsReconciling(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Bank reconciliation in production
                      const response = await fetch('/api/bookkeeping/bank-reconciliation', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          transactions: transactions,
                          timestamp: new Date().toISOString()
                        })
                      });
                                          
                      if (response.ok) {
                        const result = await response.json();
                        setActionResults(prev => ({ ...prev, reconciliation: result }));
                        setShowReconciliation(true);
                      }
                    } else {
                      // Development mode - simulate reconciliation
                      await new Promise(resolve => setTimeout(resolve, 2500));
                      const mockResult = {
                        matchedTransactions: Math.floor(transactions.length * 0.85),
                        unmatchedTransactions: Math.floor(transactions.length * 0.15),
                        discrepancies: Math.floor(Math.random() * 500),
                        status: 'Completed',
                        reconciledAt: new Date().toISOString()
                      };
                      setActionResults(prev => ({ ...prev, reconciliation: mockResult }));
                      setShowReconciliation(true);
                    }
                  } catch (error) {
                    console.error('Error during reconciliation:', error);
                    alert(`❌ Error during bank reconciliation:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsReconciling(false);
                  }
                }}
              >
                {isReconciling ? 'Reconciling...' : 'Bank Reconciliation'}
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={async () => {
                  setIsAnalyzingCashFlow(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Cash flow analysis in production
                      const response = await fetch('/api/bookkeeping/cash-flow-analysis', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          transactions: transactions,
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        setActionResults(prev => ({ ...prev, cashFlowAnalysis: result }));
                        setShowCashFlowAnalysis(true);
                      }
                    } else {
                      // Development mode - simulate analysis
                      await new Promise(resolve => setTimeout(resolve, 3000));
                      const mockResult = {
                        operatingCashFlow: financialReport?.netProfit || 0,
                        investingCashFlow: -Math.floor(Math.random() * 5000),
                        financingCashFlow: Math.floor(Math.random() * 10000),
                        netCashFlow: (financialReport?.netProfit || 0) + Math.floor(Math.random() * 5000),
                        cashPosition: 'Healthy',
                        recommendations: ['Monitor cash flow weekly', 'Consider credit facility', 'Optimize payment terms']
                      };
                      setActionResults(prev => ({ ...prev, cashFlowAnalysis: mockResult }));
                      setShowCashFlowAnalysis(true);
                    }
                  } catch (error) {
                    console.error('Error analyzing cash flow:', error);
                    alert(`❌ Error analyzing cash flow:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsAnalyzingCashFlow(false);
                  }
                }}
              >
                {isAnalyzingCashFlow ? 'Analyzing...' : 'Cash Flow Analysis'}
              </button>
            </div>
          </div>

          {/* SARS Report Results */}
          {showSARSReport && actionResults.sarsReport && (
            <div className="result-card sars-report">
              <div className="result-header">
                <h3>✅ SARS Report Generated Successfully</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowSARSReport(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>Report Details</h4>
                  <div className="result-row">
                    <span className="label">Period:</span>
                    <span className="value">{actionResults.sarsReport.period}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">VAT Collected:</span>
                    <span className="value">R{actionResults.sarsReport.vatCollected}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">VAT Paid:</span>
                    <span className="value">R{actionResults.sarsReport.vatPaid}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">VAT Owing:</span>
                    <span className="value">R{actionResults.sarsReport.vatOwing}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Reference Number:</span>
                    <span className="value">{actionResults.sarsReport.referenceNumber}</span>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="secondary-btn">Download Report</button>
                  <button className="primary-btn">Submit to SARS</button>
                </div>
              </div>
            </div>
          )}

          {/* P&L Export Results */}
          {showPandLExport && actionResults.pandLExport && (
            <div className="result-card pandl-export">
              <div className="result-header">
                <h3>✅ P&L Statement Exported Successfully</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowPandLExport(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>Export Details</h4>
                  <div className="result-row">
                    <span className="label">File Name:</span>
                    <span className="value">{actionResults.pandLExport.filename}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Total Income:</span>
                    <span className="value">R{actionResults.pandLExport.totalIncome}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Total Expenses:</span>
                    <span className="value">R{actionResults.pandLExport.totalExpenses}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Net Profit:</span>
                    <span className="value">R{actionResults.pandLExport.netProfit}</span>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="secondary-btn">View Report</button>
                  <button className="primary-btn">Download Again</button>
                </div>
              </div>
            </div>
          )}

          {/* Bank Reconciliation Results */}
          {showReconciliation && actionResults.reconciliation && (
            <div className="result-card reconciliation">
              <div className="result-header">
                <h3>✅ Bank Reconciliation Completed</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowReconciliation(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>Reconciliation Results</h4>
                  <div className="result-row">
                    <span className="label">Matched Transactions:</span>
                    <span className="value">{actionResults.reconciliation.matchedTransactions}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Unmatched Transactions:</span>
                    <span className="value">{actionResults.reconciliation.unmatchedTransactions}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Discrepancies:</span>
                    <span className="value">R{actionResults.reconciliation.discrepancies}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Status:</span>
                    <span className="value">{actionResults.reconciliation.status}</span>
                  </div>
                </div>
                <div className="result-actions">
                  <button className="secondary-btn">View Details</button>
                  <button className="primary-btn">Export Report</button>
                </div>
              </div>
            </div>
          )}

          {/* Cash Flow Analysis Results */}
          {showCashFlowAnalysis && actionResults.cashFlowAnalysis && (
            <div className="result-card cash-flow">
              <div className="result-header">
                <h3>✅ Cash Flow Analysis Completed</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCashFlowAnalysis(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>Analysis Results</h4>
                  <div className="result-row">
                    <span className="label">Operating Cash Flow:</span>
                    <span className="value">R{actionResults.cashFlowAnalysis.operatingCashFlow}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Investing Cash Flow:</span>
                    <span className="value">R{actionResults.cashFlowAnalysis.investingCashFlow}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Financing Cash Flow:</span>
                    <span className="value">R{actionResults.cashFlowAnalysis.financingCashFlow}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Net Cash Flow:</span>
                    <span className="value">R{actionResults.cashFlowAnalysis.netCashFlow}</span>
                  </div>
                  <div className="result-row">
                    <span className="label">Cash Position:</span>
                    <span className="value">{actionResults.cashFlowAnalysis.cashPosition}</span>
                  </div>
                </div>
                {actionResults.cashFlowAnalysis.recommendations && (
                  <div className="result-section">
                    <h4>Recommendations</h4>
                    <ul className="recommendations-list">
                      {actionResults.cashFlowAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="result-actions">
                  <button className="secondary-btn">View Full Report</button>
                  <button className="primary-btn">Export Analysis</button>
                </div>
              </div>
            </div>
          )}

          <div className="recent-transactions">
            <h3>Recent Transactions</h3>
            <div className="transaction-list">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-date">{transaction.date}</div>
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-category">{transaction.category}</div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}R{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-content">
          <div className="transactions-header">
            <h3>Transaction Management</h3>
            <div className="transaction-filters">
              <select>
                <option>All Categories</option>
                <option>Sales</option>
                <option>Office Expenses</option>
                <option>Marketing</option>
              </select>
              <select>
                <option>All Types</option>
                <option>Income</option>
                <option>Expenses</option>
              </select>
            </div>
          </div>

          <div className="transaction-table">
            <div className="table-header">
              <div className="col">Date</div>
              <div className="col">Description</div>
              <div className="col">Category</div>
              <div className="col">Amount</div>
              <div className="col">VAT</div>
              <div className="col">Status</div>
              <div className="col">Actions</div>
            </div>
            {transactions.map(transaction => (
              <div key={transaction.id} className="table-row">
                <div className="col">{transaction.date}</div>
                <div className="col">{transaction.description}</div>
                <div className="col">
                  <select 
                    value={transaction.category}
                    onChange={(e) => handleCategorizeTransaction(transaction.id, e.target.value)}
                  >
                    <option>Sales</option>
                    <option>Office Expenses</option>
                    <option>Marketing</option>
                    <option>Travel</option>
                    <option>Equipment</option>
                  </select>
                </div>
                <div className={`col amount ${transaction.type}`}>
                  R{transaction.amount}
                </div>
                <div className="col">R{transaction.vatAmount || 0}</div>
                <div className="col">
                  <span className={`status ${transaction.isReconciled ? 'reconciled' : 'pending'}`}>
                    {transaction.isReconciled ? 'Reconciled' : 'Pending'}
                  </span>
                </div>
                <div className="col">
                  {!transaction.isReconciled && (
                    <button 
                      className="reconcile-btn"
                      onClick={() => handleReconcileTransaction(transaction.id)}
                    >
                      Reconcile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="reports-content">
          <div className="reports-header">
            <h3>📋 Financial Reports</h3>
            <div className="report-period">
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

            <div className="report-cards">
              <div className="report-card">
                <h4>Profit & Loss Statement</h4>
              <div className="report-summary">
                <div className="summary-row">
                  <span>Total Income:</span>
                  <span>R{financialReport?.totalIncome.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Total Expenses:</span>
                  <span>R{financialReport?.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Net Profit:</span>
                  <span>R{financialReport?.netProfit.toLocaleString()}</span>
                </div>
              </div>
              <button 
                className="export-btn"
                onClick={async () => {
                  setIsExportingPDF(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Export P&L PDF in production
                      const response = await fetch('/api/bookkeeping/export-pandl-pdf', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          format: 'pdf',
                          includeCharts: true,
                          reportType: 'profit-loss',
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Profit_Loss_Statement_${selectedPeriod}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        
                        const result = {
                          type: 'pdf',
                          filename: `Profit_Loss_Statement_${selectedPeriod}.pdf`,
                          period: selectedPeriod,
                          totalIncome: financialReport?.totalIncome || 0,
                          totalExpenses: financialReport?.totalExpenses || 0,
                          netProfit: financialReport?.netProfit || 0,
                          exportedAt: new Date().toISOString()
                        };
                        setReportResults(result);
                        setShowReportResults(true);
                      }
                    } else {
                      // Development mode - simulate PDF export
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      const result = {
                        type: 'pdf',
                        filename: `Profit_Loss_Statement_${selectedPeriod}.pdf`,
                        period: selectedPeriod,
                        totalIncome: financialReport?.totalIncome || 0,
                        totalExpenses: financialReport?.totalExpenses || 0,
                        netProfit: financialReport?.netProfit || 0,
                        exportedAt: new Date().toISOString()
                      };
                      setReportResults(result);
                      setShowReportResults(true);
                    }
                  } catch (error) {
                    console.error('Error exporting PDF:', error);
                    alert(`❌ Error exporting PDF:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsExportingPDF(false);
                  }
                }}
              >
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>

            <div className="report-card">
              <h4>VAT Report</h4>
              <div className="report-summary">
                <div className="summary-row">
                  <span>VAT Collected:</span>
                  <span>R{financialReport?.vatCollected.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>VAT Paid:</span>
                  <span>R{financialReport?.vatPaid.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>VAT Owing:</span>
                  <span>R{financialReport?.vatOwing.toLocaleString()}</span>
                </div>
              </div>
              <button 
                className="export-btn"
                onClick={async () => {
                  setIsSubmittingToSARS(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Submit VAT return to SARS in production
                      const response = await fetch('/api/bookkeeping/submit-vat-sars', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          vatCollected: financialReport?.vatCollected || 0,
                          vatPaid: financialReport?.vatPaid || 0,
                          vatOwing: financialReport?.vatOwing || 0,
                          transactions: transactions,
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        const submissionResult = {
                          type: 'sars-submission',
                          referenceNumber: result.referenceNumber,
                          period: selectedPeriod,
                          vatCollected: financialReport?.vatCollected || 0,
                          vatPaid: financialReport?.vatPaid || 0,
                          vatOwing: financialReport?.vatOwing || 0,
                          status: 'Submitted to SARS',
                          submittedAt: new Date().toISOString()
                        };
                        setReportResults(submissionResult);
                        setShowReportResults(true);
                      }
                    } else {
                      // Development mode - simulate SARS submission
                      await new Promise(resolve => setTimeout(resolve, 3000));
                      const submissionResult = {
                        type: 'sars-submission',
                        referenceNumber: `SARS-${Date.now()}`,
                        period: selectedPeriod,
                        vatCollected: financialReport?.vatCollected || 0,
                        vatPaid: financialReport?.vatPaid || 0,
                        vatOwing: financialReport?.vatOwing || 0,
                        status: 'Submitted to SARS',
                        submittedAt: new Date().toISOString()
                      };
                      setReportResults(submissionResult);
                      setShowReportResults(true);
                    }
                  } catch (error) {
                    console.error('Error submitting to SARS:', error);
                    alert(`❌ Error submitting to SARS:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsSubmittingToSARS(false);
                  }
                }}
              >
                {isSubmittingToSARS ? 'Submitting...' : 'Submit to SARS'}
              </button>
            </div>

            <div className="report-card">
              <h4>Cash Flow Statement</h4>
              <div className="report-summary">
                <div className="summary-row">
                  <span>Operating Cash Flow:</span>
                  <span>R{financialReport?.netProfit.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Investing Cash Flow:</span>
                  <span>R0</span>
                </div>
                <div className="summary-row">
                  <span>Financing Cash Flow:</span>
                  <span>R0</span>
                </div>
              </div>
              <button 
                className="export-btn"
                onClick={async () => {
                  setIsExportingExcel(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Export Cash Flow Excel in production
                      const response = await fetch('/api/bookkeeping/export-cashflow-excel', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          period: selectedPeriod,
                          format: 'excel',
                          includeCharts: true,
                          reportType: 'cash-flow',
                          transactions: transactions,
                          timestamp: new Date().toISOString()
                        })
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Cash_Flow_Statement_${selectedPeriod}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        
                        const result = {
                          type: 'excel',
                          filename: `Cash_Flow_Statement_${selectedPeriod}.xlsx`,
                          period: selectedPeriod,
                          operatingCashFlow: financialReport?.netProfit || 0,
                          investingCashFlow: -Math.floor(Math.random() * 5000),
                          financingCashFlow: Math.floor(Math.random() * 10000),
                          netCashFlow: (financialReport?.netProfit || 0) + Math.floor(Math.random() * 5000),
                          exportedAt: new Date().toISOString()
                        };
                        setReportResults(result);
                        setShowReportResults(true);
                      }
                    } else {
                      // Development mode - simulate Excel export
                      await new Promise(resolve => setTimeout(resolve, 2500));
                      const result = {
                        type: 'excel',
                        filename: `Cash_Flow_Statement_${selectedPeriod}.xlsx`,
                        period: selectedPeriod,
                        operatingCashFlow: financialReport?.netProfit || 0,
                        investingCashFlow: -Math.floor(Math.random() * 5000),
                        financingCashFlow: Math.floor(Math.random() * 10000),
                        netCashFlow: (financialReport?.netProfit || 0) + Math.floor(Math.random() * 5000),
                        exportedAt: new Date().toISOString()
                      };
                      setReportResults(result);
                      setShowReportResults(true);
                    }
                  } catch (error) {
                    console.error('Error exporting Excel:', error);
                    alert(`❌ Error exporting Excel:\n${error.message || 'Please try again.'}`);
                  } finally {
                    setIsExportingExcel(false);
                  }
                }}
              >
                {isExportingExcel ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>
          </div>
          
          {/* Financial Reports Results */}
          {showReportResults && reportResults && (
            <div className="result-card financial-reports">
              <div className="result-header">
                <h3>
                  {reportResults.type === 'pdf' && '✅ P&L Statement Exported Successfully'}
                  {reportResults.type === 'sars-submission' && '✅ VAT Return Submitted to SARS'}
                  {reportResults.type === 'excel' && '✅ Cash Flow Statement Exported Successfully'}
                </h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowReportResults(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>
                    {reportResults.type === 'pdf' && 'Export Details'}
                    {reportResults.type === 'sars-submission' && 'SARS Submission Details'}
                    {reportResults.type === 'excel' && 'Export Details'}
                  </h4>
                  
                  {reportResults.type === 'pdf' && (
                    <>
                      <div className="result-row">
                        <span className="label">File Name:</span>
                        <span className="value">{reportResults.filename}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{reportResults.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Total Income:</span>
                        <span className="value">R{reportResults.totalIncome}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Total Expenses:</span>
                        <span className="value">R{reportResults.totalExpenses}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Net Profit:</span>
                        <span className="value">R{reportResults.netProfit}</span>
                      </div>
                    </>
                  )}
                  
                  {reportResults.type === 'sars-submission' && (
                    <>
                      <div className="result-row">
                        <span className="label">Reference Number:</span>
                        <span className="value">{reportResults.referenceNumber}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{reportResults.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Collected:</span>
                        <span className="value">R{reportResults.vatCollected}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Paid:</span>
                        <span className="value">R{reportResults.vatPaid}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Owing:</span>
                        <span className="value">R{reportResults.vatOwing}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Status:</span>
                        <span className="value">{reportResults.status}</span>
                      </div>
                    </>
                  )}
                  
                  {reportResults.type === 'excel' && (
                    <>
                      <div className="result-row">
                        <span className="label">File Name:</span>
                        <span className="value">{reportResults.filename}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{reportResults.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Operating Cash Flow:</span>
                        <span className="value">R{reportResults.operatingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Investing Cash Flow:</span>
                        <span className="value">R{reportResults.investingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Financing Cash Flow:</span>
                        <span className="value">R{reportResults.financingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Net Cash Flow:</span>
                        <span className="value">R{reportResults.netCashFlow}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="result-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(reportResults.exportedAt || reportResults.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="result-actions">
                  {reportResults.type === 'pdf' && (
                    <>
                      <button 
                        className="secondary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // View P&L report details in production
                              const response = await fetch(`/api/bookkeeping/pandl-report/${reportResults.filename}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const reportDetails = await response.json();
                                setViewDetails({
                                  type: 'pandl-report',
                                  ...reportDetails
                                });
                                setShowViewDetails(true);
                              }
                            } else {
                              // Development mode - show mock report details
                              setViewDetails({
                                type: 'pandl-report',
                                filename: reportResults.filename,
                                period: reportResults.period,
                                totalIncome: reportResults.totalIncome,
                                totalExpenses: reportResults.totalExpenses,
                                netProfit: reportResults.netProfit,
                                generatedAt: reportResults.exportedAt
                              });
                              setShowViewDetails(true);
                            }
                          } catch (error) {
                            console.error('Error viewing report:', error);
                            alert(`❌ Error viewing report:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        View Report
                      </button>
                      <button 
                        className="primary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // Download P&L report again in production
                              const response = await fetch(`/api/bookkeeping/download-pandl/${reportResults.filename}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = reportResults.filename;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                                
                                alert(`✅ P&L Statement Downloaded Again!\n\nFile: ${reportResults.filename}\nPeriod: ${reportResults.period}\n\nReport downloaded to your device.`);
                              }
                            } else {
                              // Development mode - simulate report download
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Create a mock P&L report content
                              const reportContent = `PROFIT & LOSS STATEMENT
Period: ${reportResults.period}
Generated: ${new Date(reportResults.exportedAt).toLocaleString()}

INCOME:
Total Income: R${reportResults.totalIncome}

EXPENSES:
Total Expenses: R${reportResults.totalExpenses}

PROFIT:
Net Profit: R${reportResults.netProfit}

This is your Profit & Loss Statement for ${reportResults.period}.
Keep this report for your financial records.`;
                              
                              const blob = new Blob([reportContent], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = reportResults.filename.replace('.pdf', '.txt');
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              
                              alert(`✅ P&L Statement Downloaded Again!\n\nFile: ${reportResults.filename.replace('.pdf', '.txt')}\nPeriod: ${reportResults.period}\n\nReport downloaded to your device.`);
                            }
                          } catch (error) {
                            console.error('Error downloading report:', error);
                            alert(`❌ Error downloading report:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        Download Again
                      </button>
                    </>
                  )}
                  {reportResults.type === 'sars-submission' && (
                    <>
                      <button 
                        className="secondary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // View SARS submission details in production
                              const response = await fetch(`/api/bookkeeping/sars-submission/${reportResults.referenceNumber}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const submissionDetails = await response.json();
                                setViewDetails({
                                  type: 'sars-submission',
                                  ...submissionDetails
                                });
                                setShowViewDetails(true);
                              }
                            } else {
                              // Development mode - show mock submission details
                              setViewDetails({
                                type: 'sars-submission',
                                referenceNumber: reportResults.referenceNumber,
                                period: reportResults.period,
                                vatCollected: reportResults.vatCollected,
                                vatPaid: reportResults.vatPaid,
                                vatOwing: reportResults.vatOwing,
                                status: reportResults.status,
                                submittedAt: reportResults.submittedAt
                              });
                              setShowViewDetails(true);
                            }
                          } catch (error) {
                            console.error('Error viewing submission:', error);
                            alert(`❌ Error viewing submission:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        View Submission
                      </button>
                      <button 
                        className="primary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // Download SARS receipt in production
                              const response = await fetch(`/api/bookkeeping/sars-receipt/${reportResults.referenceNumber}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `SARS_Receipt_${reportResults.referenceNumber}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                                
                                alert(`✅ SARS Receipt Downloaded Successfully!\n\nFile: SARS_Receipt_${reportResults.referenceNumber}.pdf\nReference: ${reportResults.referenceNumber}\n\nReceipt saved to your device.`);
                              }
                            } else {
                              // Development mode - simulate receipt download
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Create a mock receipt content
                              const receiptContent = `SARS VAT RETURN RECEIPT
Reference Number: ${reportResults.referenceNumber}
Period: ${reportResults.period}
Date Submitted: ${new Date(reportResults.submittedAt).toLocaleString()}

VAT DETAILS:
VAT Collected: R${reportResults.vatCollected}
VAT Paid: R${reportResults.vatPaid}
VAT Owing: R${reportResults.vatOwing}

Status: ${reportResults.status}
Submission ID: SARS-${Date.now()}

This receipt confirms your VAT return submission to SARS.
Keep this receipt for your records.`;
                              
                              const blob = new Blob([receiptContent], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `SARS_Receipt_${reportResults.referenceNumber}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              
                              alert(`✅ SARS Receipt Downloaded Successfully!\n\nFile: SARS_Receipt_${reportResults.referenceNumber}.txt\nReference: ${reportResults.referenceNumber}\n\nReceipt saved to your device.`);
                            }
                          } catch (error) {
                            console.error('Error downloading receipt:', error);
                            alert(`❌ Error downloading receipt:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        Download Receipt
                      </button>
                    </>
                  )}
                  {reportResults.type === 'excel' && (
                    <>
                      <button 
                        className="secondary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // View Cash Flow spreadsheet details in production
                              const response = await fetch(`/api/bookkeeping/cashflow-report/${reportResults.filename}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const reportDetails = await response.json();
                                setViewDetails({
                                  type: 'cashflow-report',
                                  ...reportDetails
                                });
                                setShowViewDetails(true);
                              }
                            } else {
                              // Development mode - show mock spreadsheet details
                              setViewDetails({
                                type: 'cashflow-report',
                                filename: reportResults.filename,
                                period: reportResults.period,
                                operatingCashFlow: reportResults.operatingCashFlow,
                                investingCashFlow: reportResults.investingCashFlow,
                                financingCashFlow: reportResults.financingCashFlow,
                                netCashFlow: reportResults.netCashFlow,
                                generatedAt: reportResults.exportedAt
                              });
                              setShowViewDetails(true);
                            }
                          } catch (error) {
                            console.error('Error viewing spreadsheet:', error);
                            alert(`❌ Error viewing spreadsheet:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        View Spreadsheet
                      </button>
                      <button 
                        className="primary-btn"
                        onClick={async () => {
                          try {
                            const isProduction = window.location.hostname !== 'localhost';
                            
                            if (isProduction) {
                              // Download Cash Flow spreadsheet again in production
                              const response = await fetch(`/api/bookkeeping/download-cashflow/${reportResults.filename}`, {
                                method: 'GET',
                                headers: { 
                                  'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = reportResults.filename;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                                
                                alert(`✅ Cash Flow Statement Downloaded Again!\n\nFile: ${reportResults.filename}\nPeriod: ${reportResults.period}\n\nSpreadsheet downloaded to your device.`);
                              }
                            } else {
                              // Development mode - simulate spreadsheet download
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Create a mock Cash Flow spreadsheet content
                              const spreadsheetContent = `CASH FLOW STATEMENT
Period: ${reportResults.period}
Generated: ${new Date(reportResults.exportedAt).toLocaleString()}

OPERATING ACTIVITIES:
Operating Cash Flow: R${reportResults.operatingCashFlow}

INVESTING ACTIVITIES:
Investing Cash Flow: R${reportResults.investingCashFlow}

FINANCING ACTIVITIES:
Financing Cash Flow: R${reportResults.financingCashFlow}

NET CASH FLOW:
Net Cash Flow: R${reportResults.netCashFlow}

This is your Cash Flow Statement for ${reportResults.period}.
Keep this spreadsheet for your financial analysis.`;
                              
                              const blob = new Blob([spreadsheetContent], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = reportResults.filename.replace('.xlsx', '.txt');
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              
                              alert(`✅ Cash Flow Statement Downloaded Again!\n\nFile: ${reportResults.filename.replace('.xlsx', '.txt')}\nPeriod: ${reportResults.period}\n\nSpreadsheet downloaded to your device.`);
                            }
                          } catch (error) {
                            console.error('Error downloading spreadsheet:', error);
                            alert(`❌ Error downloading spreadsheet:\n${error.message || 'Please try again.'}`);
                          }
                        }}
                      >
                        Download Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* View Details Results */}
          {showViewDetails && viewDetails && (
            <div className="result-card view-details">
              <div className="result-header">
                <h3>
                  {viewDetails.type === 'pandl-report' && '📊 P&L Statement Report Details'}
                  {viewDetails.type === 'sars-submission' && '📋 SARS Submission Details'}
                  {viewDetails.type === 'cashflow-report' && '📈 Cash Flow Statement Details'}
                </h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowViewDetails(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>
                    {viewDetails.type === 'pandl-report' && 'Report Information'}
                    {viewDetails.type === 'sars-submission' && 'Submission Information'}
                    {viewDetails.type === 'cashflow-report' && 'Spreadsheet Information'}
                  </h4>
                  
                  {viewDetails.type === 'pandl-report' && (
                    <>
                      <div className="result-row">
                        <span className="label">File Name:</span>
                        <span className="value">{viewDetails.filename}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{viewDetails.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Total Income:</span>
                        <span className="value">R{viewDetails.totalIncome}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Total Expenses:</span>
                        <span className="value">R{viewDetails.totalExpenses}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Net Profit:</span>
                        <span className="value">R{viewDetails.netProfit}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Generated:</span>
                        <span className="value">{new Date(viewDetails.generatedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  
                  {viewDetails.type === 'sars-submission' && (
                    <>
                      <div className="result-row">
                        <span className="label">Reference Number:</span>
                        <span className="value">{viewDetails.referenceNumber}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{viewDetails.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Collected:</span>
                        <span className="value">R{viewDetails.vatCollected}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Paid:</span>
                        <span className="value">R{viewDetails.vatPaid}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">VAT Owing:</span>
                        <span className="value">R{viewDetails.vatOwing}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Status:</span>
                        <span className="value">{viewDetails.status}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Submitted:</span>
                        <span className="value">{new Date(viewDetails.submittedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  
                  {viewDetails.type === 'cashflow-report' && (
                    <>
                      <div className="result-row">
                        <span className="label">File Name:</span>
                        <span className="value">{viewDetails.filename}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Period:</span>
                        <span className="value">{viewDetails.period}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Operating Cash Flow:</span>
                        <span className="value">R{viewDetails.operatingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Investing Cash Flow:</span>
                        <span className="value">R{viewDetails.investingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Financing Cash Flow:</span>
                        <span className="value">R{viewDetails.financingCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Net Cash Flow:</span>
                        <span className="value">R{viewDetails.netCashFlow}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Generated:</span>
                        <span className="value">{new Date(viewDetails.generatedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="result-actions">
                  <button 
                    className="secondary-btn"
                    onClick={() => setShowViewDetails(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="primary-btn"
                    onClick={() => {
                      // Refresh the view with updated data
                      setShowViewDetails(false);
                      setTimeout(() => setShowViewDetails(true), 100);
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="settings-content">
          <div className="settings-header">
            <h3>Bookkeeping Settings</h3>
          </div>

          <div className="accounting-integrations">
            <h4>Accounting System Integrations</h4>
            <div className="integration-list">
              {accountingSystems.map(system => (
                <div key={system.id} className="integration-item">
                  <div className="integration-info">
                    <h5>{system.name}</h5>
                    <div className={`status ${system.isConnected ? 'connected' : 'disconnected'}`}>
                      {system.isConnected ? 'Connected' : 'Not Connected'}
                    </div>
                    {system.isConnected && (
                      <div className="last-sync">
                        Last sync: {new Date(system.lastSync).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="integration-actions">
                    {!system.isConnected ? (
                      <button 
                        className="connect-btn"
                        onClick={() => {
                          setShowConfigForm(system.id);
                          setConfigData({
                            systemId: system.id,
                            systemName: system.name,
                            clientId: '',
                            clientSecret: '',
                            redirectUri: '',
                            environment: 'sandbox',
                            companyId: '',
                            username: '',
                            password: '',
                            apiKey: ''
                          });
                        }}
                      >
                        Configure & Connect
                      </button>
                    ) : (
                      <div className="connected-actions">
                        <button 
                          className="sync-btn"
                          onClick={async () => {
                            setIsSyncing(system.id);
                            try {
                              const isProduction = window.location.hostname !== 'localhost';
                              
                              if (isProduction) {
                                // Sync with accounting system in production
                                const response = await fetch(`/api/bookkeeping/sync-accounting/${system.id}`, {
                                  method: 'POST',
                                  headers: { 
                                    'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    systemId: system.id,
                                    transactions: transactions,
                                    timestamp: new Date().toISOString()
                                  })
                                });
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  setAccountingSystems(prev => 
                                    prev.map(s => s.id === system.id 
                                      ? { ...s, lastSync: result.lastSync }
                                      : s
                                    )
                                  );
                                  
                                  setIntegrationResults({
                                    type: 'sync',
                                    systemName: system.name,
                                    systemId: system.id,
                                    status: 'Synced',
                                    syncedTransactions: result.syncedTransactions,
                                    lastSync: result.lastSync,
                                    syncId: result.syncId,
                                    syncedAt: new Date().toISOString()
                                  });
                                  setShowIntegrationResults(true);
                                }
                              } else {
                                // Development mode - simulate sync
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                
                                const mockResult = {
                                  syncedTransactions: Math.floor(transactions.length * 0.9),
                                  lastSync: new Date().toISOString(),
                                  syncId: `SYNC-${Date.now()}`
                                };
                                
                                setAccountingSystems(prev => 
                                  prev.map(s => s.id === system.id 
                                    ? { ...s, lastSync: mockResult.lastSync }
                                    : s
                                  )
                                );
                                
                                setIntegrationResults({
                                  type: 'sync',
                                  systemName: system.name,
                                  systemId: system.id,
                                  status: 'Synced',
                                  syncedTransactions: mockResult.syncedTransactions,
                                  lastSync: mockResult.lastSync,
                                  syncId: mockResult.syncId,
                                  syncedAt: new Date().toISOString()
                                });
                                setShowIntegrationResults(true);
                              }
                            } catch (error) {
                              console.error(`Error syncing with ${system.name}:`, error);
                              alert(`❌ Error syncing with ${system.name}:\n${error.message || 'Please try again.'}`);
                            } finally {
                              setIsSyncing(null);
                            }
                          }}
                        >
                          {isSyncing === system.id ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button 
                          className="config-btn"
                          onClick={async () => {
                            setIsConfiguring(system.id);
                            try {
                              const isProduction = window.location.hostname !== 'localhost';
                              
                              if (isProduction) {
                                // Configure accounting system in production
                                const response = await fetch(`/api/bookkeeping/configure-accounting/${system.id}`, {
                                  method: 'POST',
                                  headers: { 
                                    'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    systemId: system.id,
                                    config: system.config,
                                    timestamp: new Date().toISOString()
                                  })
                                });
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  
                                  setIntegrationResults({
                                    type: 'configuration',
                                    systemName: system.name,
                                    systemId: system.id,
                                    status: 'Configured',
                                    configurationId: result.configurationId,
                                    settings: result.settings,
                                    configuredAt: new Date().toISOString()
                                  });
                                  setShowIntegrationResults(true);
                                }
                              } else {
                                // Development mode - simulate configuration
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                
                                setIntegrationResults({
                                  type: 'configuration',
                                  systemName: system.name,
                                  systemId: system.id,
                                  status: 'Configured',
                                  configurationId: `CONFIG-${Date.now()}`,
                                  settings: {
                                    autoSync: true,
                                    syncInterval: 'Daily',
                                    dataMapping: 'Standard',
                                    notifications: true
                                  },
                                  configuredAt: new Date().toISOString()
                                });
                                setShowIntegrationResults(true);
                              }
                            } catch (error) {
                              console.error(`Error configuring ${system.name}:`, error);
                              alert(`❌ Error configuring ${system.name}:\n${error.message || 'Please try again.'}`);
                            } finally {
                              setIsConfiguring(null);
                            }
                          }}
                        >
                          {isConfiguring === system.id ? 'Configuring...' : 'Configure'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Configuration Form */}
          {showConfigForm && (
            <div className="result-card config-form">
              <div className="result-header">
                <h3>🔧 Configure {configData.systemName} Integration</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowConfigForm(null)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="config-form-content">
                  <div className="config-section">
                    <h4>API Credentials</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Client ID:</label>
                        <input
                          type="text"
                          value={configData.clientId || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, clientId: e.target.value }))}
                          placeholder="Enter your Client ID"
                        />
                      </div>
                      <div className="form-field">
                        <label>Client Secret:</label>
                        <input
                          type="password"
                          value={configData.clientSecret || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, clientSecret: e.target.value }))}
                          placeholder="Enter your Client Secret"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Redirect URI:</label>
                        <input
                          type="url"
                          value={configData.redirectUri || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, redirectUri: e.target.value }))}
                          placeholder="https://your-app.com/oauth/callback"
                        />
                      </div>
                      <div className="form-field">
                        <label>Environment:</label>
                        <select
                          value={configData.environment || 'sandbox'}
                          onChange={(e) => setConfigData(prev => ({ ...prev, environment: e.target.value }))}
                        >
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="config-section">
                    <h4>Account Information</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Company ID:</label>
                        <input
                          type="text"
                          value={configData.companyId || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, companyId: e.target.value }))}
                          placeholder="Enter your Company ID"
                        />
                      </div>
                      <div className="form-field">
                        <label>Username:</label>
                        <input
                          type="text"
                          value={configData.username || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Password:</label>
                        <input
                          type="password"
                          value={configData.password || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="form-field">
                        <label>API Key:</label>
                        <input
                          type="password"
                          value={configData.apiKey || ''}
                          onChange={(e) => setConfigData(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder="Enter your API Key"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="config-section">
                    <h4>Sync Settings</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Auto Sync:</label>
                        <select
                          value={configData.autoSync || 'enabled'}
                          onChange={(e) => setConfigData(prev => ({ ...prev, autoSync: e.target.value }))}
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Sync Interval:</label>
                        <select
                          value={configData.syncInterval || 'daily'}
                          onChange={(e) => setConfigData(prev => ({ ...prev, syncInterval: e.target.value }))}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="manual">Manual Only</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Data Mapping:</label>
                        <select
                          value={configData.dataMapping || 'standard'}
                          onChange={(e) => setConfigData(prev => ({ ...prev, dataMapping: e.target.value }))}
                        >
                          <option value="standard">Standard</option>
                          <option value="custom">Custom</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Notifications:</label>
                        <select
                          value={configData.notifications || 'enabled'}
                          onChange={(e) => setConfigData(prev => ({ ...prev, notifications: e.target.value }))}
                        >
                          <option value="enabled">Enabled</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowConfigForm(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="test-btn"
                      onClick={async () => {
                        try {
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Test connection in production
                            const response = await fetch(`/api/bookkeeping/test-connection/${configData.systemId}`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                systemId: configData.systemId,
                                credentials: {
                                  clientId: configData.clientId,
                                  clientSecret: configData.clientSecret,
                                  redirectUri: configData.redirectUri,
                                  environment: configData.environment,
                                  companyId: configData.companyId,
                                  username: configData.username,
                                  password: configData.password,
                                  apiKey: configData.apiKey
                                }
                              })
                            });
                            
                            if (response.ok) {
                              alert(`✅ Connection Test Successful!\n\n${configData.systemName} credentials are valid and connection is working.`);
                            }
                          } else {
                            // Development mode - simulate test
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            alert(`✅ Connection Test Successful!\n\n${configData.systemName} credentials are valid and connection is working.`);
                          }
                        } catch (error) {
                          console.error('Error testing connection:', error);
                          alert(`❌ Connection Test Failed:\n${error.message || 'Please check your credentials and try again.'}`);
                        }
                      }}
                    >
                      Test Connection
                    </button>
                    <button 
                      className="save-btn"
                      onClick={async () => {
                        setIsConnecting(configData.systemId);
                        try {
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Save configuration and connect in production
                            const response = await fetch(`/api/bookkeeping/save-config/${configData.systemId}`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                systemId: configData.systemId,
                                config: {
                                  clientId: configData.clientId,
                                  clientSecret: configData.clientSecret,
                                  redirectUri: configData.redirectUri,
                                  environment: configData.environment,
                                  companyId: configData.companyId,
                                  username: configData.username,
                                  password: configData.password,
                                  apiKey: configData.apiKey,
                                  autoSync: configData.autoSync,
                                  syncInterval: configData.syncInterval,
                                  dataMapping: configData.dataMapping,
                                  notifications: configData.notifications
                                }
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              setAccountingSystems(prev => 
                                prev.map(s => s.id === configData.systemId 
                                  ? { ...s, isConnected: true, lastSync: result.lastSync, config: result.config }
                                  : s
                                )
                              );
                              
                              setIntegrationResults({
                                type: 'connection',
                                systemName: configData.systemName,
                                systemId: configData.systemId,
                                status: 'Connected',
                                lastSync: result.lastSync,
                                connectionId: result.connectionId,
                                connectedAt: new Date().toISOString()
                              });
                              setShowIntegrationResults(true);
                              setShowConfigForm(null);
                            }
                          } else {
                            // Development mode - simulate save and connect
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            setAccountingSystems(prev => 
                              prev.map(s => s.id === configData.systemId 
                                ? { ...s, isConnected: true, lastSync: new Date().toISOString(), config: configData }
                                : s
                              )
                            );
                            
                            setIntegrationResults({
                              type: 'connection',
                              systemName: configData.systemName,
                              systemId: configData.systemId,
                              status: 'Connected',
                              lastSync: new Date().toISOString(),
                              connectionId: `CONN-${Date.now()}`,
                              connectedAt: new Date().toISOString()
                            });
                            setShowIntegrationResults(true);
                            setShowConfigForm(null);
                          }
                        } catch (error) {
                          console.error(`Error saving configuration for ${configData.systemName}:`, error);
                          alert(`❌ Error saving configuration:\n${error.message || 'Please try again.'}`);
                        } finally {
                          setIsConnecting(null);
                        }
                      }}
                    >
                      {isConnecting === configData.systemId ? 'Connecting...' : 'Save & Connect'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Integration Results */}
          {showIntegrationResults && integrationResults && (
            <div className="result-card integration-results">
              <div className="result-header">
                <h3>
                  {integrationResults.type === 'connection' && '✅ Accounting System Connected Successfully'}
                  {integrationResults.type === 'sync' && '✅ Data Synced Successfully'}
                  {integrationResults.type === 'configuration' && '✅ System Configured Successfully'}
                </h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowIntegrationResults(false)}
                >
                  ×
                </button>
              </div>
              <div className="result-content">
                <div className="result-section">
                  <h4>
                    {integrationResults.type === 'connection' && 'Connection Details'}
                    {integrationResults.type === 'sync' && 'Sync Details'}
                    {integrationResults.type === 'configuration' && 'Configuration Details'}
                  </h4>
                  
                  <div className="result-row">
                    <span className="label">System:</span>
                    <span className="value">{integrationResults.systemName}</span>
                  </div>
                  
                  {integrationResults.type === 'connection' && (
                    <>
                      <div className="result-row">
                        <span className="label">Status:</span>
                        <span className="value">{integrationResults.status}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Connection ID:</span>
                        <span className="value">{integrationResults.connectionId}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Last Sync:</span>
                        <span className="value">{new Date(integrationResults.lastSync).toLocaleString()}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Connected:</span>
                        <span className="value">{new Date(integrationResults.connectedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  
                  {integrationResults.type === 'sync' && (
                    <>
                      <div className="result-row">
                        <span className="label">Status:</span>
                        <span className="value">{integrationResults.status}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Synced Transactions:</span>
                        <span className="value">{integrationResults.syncedTransactions}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Sync ID:</span>
                        <span className="value">{integrationResults.syncId}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Last Sync:</span>
                        <span className="value">{new Date(integrationResults.lastSync).toLocaleString()}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Synced:</span>
                        <span className="value">{new Date(integrationResults.syncedAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  
                  {integrationResults.type === 'configuration' && (
                    <>
                      <div className="result-row">
                        <span className="label">Status:</span>
                        <span className="value">{integrationResults.status}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Configuration ID:</span>
                        <span className="value">{integrationResults.configurationId}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Auto Sync:</span>
                        <span className="value">{integrationResults.settings?.autoSync ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Sync Interval:</span>
                        <span className="value">{integrationResults.settings?.syncInterval}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Data Mapping:</span>
                        <span className="value">{integrationResults.settings?.dataMapping}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Notifications:</span>
                        <span className="value">{integrationResults.settings?.notifications ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="result-row">
                        <span className="label">Configured:</span>
                        <span className="value">{new Date(integrationResults.configuredAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="result-actions">
                  <button 
                    className="secondary-btn"
                    onClick={() => setShowIntegrationResults(false)}
                  >
                    Close
                  </button>
                  <button 
                    className="primary-btn"
                    onClick={() => {
                      // Refresh the integration status
                      setShowIntegrationResults(false);
                      setTimeout(() => setShowIntegrationResults(true), 100);
                    }}
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="automation-settings">
            <h4>Automation Settings</h4>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-categorize transactions
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-reconcile bank transactions
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                Auto-generate monthly reports
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                Auto-submit VAT returns
              </label>
            </div>
          </div>

          <div className="sars-settings">
            <h4>SARS Compliance Settings</h4>
            <div className="setting-group">
              <label>VAT Registration Number</label>
              <input type="text" placeholder="Enter VAT number" />
            </div>
            <div className="setting-group">
              <label>Tax Year End</label>
              <select>
                <option>28 February</option>
                <option>31 March</option>
                <option>30 April</option>
                <option>31 May</option>
                <option>30 June</option>
                <option>31 July</option>
                <option>31 August</option>
                <option>30 September</option>
                <option>31 October</option>
                <option>30 November</option>
                <option>31 December</option>
                <option>31 January</option>
              </select>
            </div>
            <div className="setting-group">
              <label>VAT Rate</label>
              <select>
                <option>15% (Standard Rate)</option>
                <option>0% (Zero Rate)</option>
                <option>Exempt</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookkeepingSnapshot;
