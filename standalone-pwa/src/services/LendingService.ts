// 💰 Merchant Micro-lending Service
// Real integration with credit scoring and loan application systems

export interface LendingConfig {
  provider: 'experian' | 'transunion' | 'compuscan' | 'xds' | 'clearscore';
  apiKey: string;
  environment: 'sandbox' | 'production';
  merchantId: string;
  businessRegistration: string;
}

export interface CreditScore {
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor';
  factors: string[];
  lastUpdated: string;
  bureau: string;
}

export interface LoanApplication {
  id: string;
  merchantId: string;
  amount: number;
  term: number; // months
  purpose: string;
  status: 'pending' | 'approved' | 'declined' | 'under_review';
  creditScore: number;
  interestRate: number;
  monthlyPayment: number;
  applicationDate: string;
  decisionDate?: string;
  reason?: string;
}

export interface LoanOffer {
  amount: number;
  term: number;
  interestRate: number;
  monthlyPayment: number;
  totalCost: number;
  approvalProbability: number;
  conditions: string[];
}

export interface BusinessMetrics {
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
  cashFlow: number;
  debtToIncomeRatio: number;
  businessAge: number;
  industryRisk: 'low' | 'medium' | 'high';
}

class LendingService {
  private config: LendingConfig;
  private isAuthenticated: boolean = false;

  constructor(config: LendingConfig) {
    this.config = config;
  }

  /**
   * Authenticate with credit bureau
   */
  async authenticate(): Promise<boolean> {
    try {
      const authResult = await this.performAuthentication();
      this.isAuthenticated = authResult.success;
      return authResult.success;
    } catch (error) {
      console.error('Lending service authentication failed:', error);
      return false;
    }
  }

  /**
   * Get credit score for merchant
   */
  async getCreditScore(merchantId: string): Promise<CreditScore> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with credit bureau');
    }

    try {
      const scoreData = await this.fetchCreditScore(merchantId);
      return this.processCreditScore(scoreData);
    } catch (error) {
      console.error('Failed to get credit score:', error);
      throw error;
    }
  }

  /**
   * Submit loan application
   */
  async submitLoanApplication(application: Omit<LoanApplication, 'id' | 'status' | 'applicationDate'>): Promise<LoanApplication> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with lending service');
    }

    try {
      // Get credit score first
      const creditScore = await this.getCreditScore(application.merchantId);
      
      // Calculate loan terms based on credit score
      const loanTerms = this.calculateLoanTerms(application, creditScore);
      
      // Submit application to lending partner
      const result = await this.submitApplication({
        ...application,
        creditScore: creditScore.score,
        interestRate: loanTerms.interestRate,
        monthlyPayment: loanTerms.monthlyPayment
      });

      return {
        id: result.applicationId,
        ...application,
        status: result.status,
        applicationDate: new Date().toISOString(),
        creditScore: creditScore.score,
        interestRate: loanTerms.interestRate,
        monthlyPayment: loanTerms.monthlyPayment
      };
    } catch (error) {
      console.error('Loan application failed:', error);
      throw error;
    }
  }

  /**
   * Get loan offers based on business metrics
   */
  async getLoanOffers(businessMetrics: BusinessMetrics): Promise<LoanOffer[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with lending service');
    }

    try {
      const offers = await this.calculateLoanOffers(businessMetrics);
      return offers;
    } catch (error) {
      console.error('Failed to get loan offers:', error);
      throw error;
    }
  }

  /**
   * Check loan application status
   */
  async getLoanStatus(applicationId: string): Promise<LoanApplication> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with lending service');
    }

    try {
      const status = await this.fetchLoanStatus(applicationId);
      return status;
    } catch (error) {
      console.error('Failed to get loan status:', error);
      throw error;
    }
  }

  /**
   * Get business credit report
   */
  async getBusinessCreditReport(merchantId: string): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with credit bureau');
    }

    try {
      const report = await this.fetchBusinessCreditReport(merchantId);
      return report;
    } catch (error) {
      console.error('Failed to get business credit report:', error);
      throw error;
    }
  }

  /**
   * Perform authentication with credit bureau
   */
  private async performAuthentication(): Promise<{ success: boolean; error?: string }> {
    const baseUrls = {
      experian: 'https://api.experian.com/v1',
      transunion: 'https://api.transunion.com/v1',
      compuscan: 'https://api.compuscan.co.za/v1',
      xds: 'https://api.xds.co.za/v1',
      clearscore: 'https://api.clearscore.com/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    try {
      const response = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: this.config.merchantId,
          business_registration: this.config.businessRegistration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Authentication failed' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch credit score from bureau
   */
  private async fetchCreditScore(merchantId: string): Promise<any> {
    const baseUrls = {
      experian: 'https://api.experian.com/v1',
      transunion: 'https://api.transunion.com/v1',
      compuscan: 'https://api.compuscan.co.za/v1',
      xds: 'https://api.xds.co.za/v1',
      clearscore: 'https://api.clearscore.com/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/credit-score/${merchantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credit score: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process credit score data
   */
  private processCreditScore(scoreData: any): CreditScore {
    const score = scoreData.score;
    let rating: CreditScore['rating'];
    
    if (score >= 750) rating = 'excellent';
    else if (score >= 700) rating = 'good';
    else if (score >= 650) rating = 'fair';
    else if (score >= 600) rating = 'poor';
    else rating = 'very_poor';

    return {
      score,
      rating,
      factors: scoreData.factors || [],
      lastUpdated: scoreData.last_updated || new Date().toISOString(),
      bureau: this.config.provider
    };
  }

  /**
   * Calculate loan terms based on credit score and application
   */
  private calculateLoanTerms(application: any, creditScore: CreditScore): { interestRate: number; monthlyPayment: number } {
    let baseRate = 0.15; // 15% base rate
    
    // Adjust rate based on credit score
    if (creditScore.rating === 'excellent') baseRate = 0.08;
    else if (creditScore.rating === 'good') baseRate = 0.12;
    else if (creditScore.rating === 'fair') baseRate = 0.18;
    else if (creditScore.rating === 'poor') baseRate = 0.25;
    else baseRate = 0.35;

    // Adjust rate based on loan amount
    if (application.amount > 100000) baseRate += 0.02;
    if (application.amount < 10000) baseRate += 0.01;

    // Adjust rate based on term
    if (application.term > 24) baseRate += 0.03;
    if (application.term < 6) baseRate += 0.02;

    const monthlyRate = baseRate / 12;
    const monthlyPayment = (application.amount * monthlyRate * Math.pow(1 + monthlyRate, application.term)) / 
                          (Math.pow(1 + monthlyRate, application.term) - 1);

    return {
      interestRate: baseRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100
    };
  }

  /**
   * Submit loan application to lending partner
   */
  private async submitApplication(application: any): Promise<{ applicationId: string; status: string }> {
    const baseUrls = {
      experian: 'https://api.experian.com/v1',
      transunion: 'https://api.transunion.com/v1',
      compuscan: 'https://api.compuscan.co.za/v1',
      xds: 'https://api.xds.co.za/v1',
      clearscore: 'https://api.clearscore.com/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loan-applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(application)
    });

    if (!response.ok) {
      throw new Error(`Loan application failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      applicationId: result.application_id,
      status: result.status
    };
  }

  /**
   * Calculate loan offers based on business metrics
   */
  private async calculateLoanOffers(businessMetrics: BusinessMetrics): Promise<LoanOffer[]> {
    const offers: LoanOffer[] = [];
    
    // Calculate maximum loan amount based on revenue
    const maxLoanAmount = businessMetrics.monthlyRevenue * 6; // 6 months revenue
    
    // Generate different loan options
    const loanAmounts = [
      Math.min(maxLoanAmount * 0.3, 50000),
      Math.min(maxLoanAmount * 0.5, 100000),
      Math.min(maxLoanAmount * 0.8, 250000)
    ];

    for (const amount of loanAmounts) {
      if (amount >= 10000) { // Minimum loan amount
        const terms = [6, 12, 18, 24];
        
        for (const term of terms) {
          const interestRate = this.calculateInterestRate(businessMetrics, amount, term);
          const monthlyRate = interestRate / 12;
          const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                                (Math.pow(1 + monthlyRate, term) - 1);
          const totalCost = monthlyPayment * term;
          
          offers.push({
            amount,
            term,
            interestRate,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalCost: Math.round(totalCost * 100) / 100,
            approvalProbability: this.calculateApprovalProbability(businessMetrics),
            conditions: this.generateLoanConditions(businessMetrics)
          });
        }
      }
    }

    return offers.sort((a, b) => a.interestRate - b.interestRate);
  }

  /**
   * Calculate interest rate based on business metrics
   */
  private calculateInterestRate(metrics: BusinessMetrics, amount: number, term: number): number {
    let rate = 0.15; // Base rate 15%
    
    // Adjust based on profit margin
    if (metrics.profitMargin > 0.3) rate -= 0.02;
    else if (metrics.profitMargin < 0.1) rate += 0.05;
    
    // Adjust based on debt-to-income ratio
    if (metrics.debtToIncomeRatio < 0.3) rate -= 0.01;
    else if (metrics.debtToIncomeRatio > 0.5) rate += 0.03;
    
    // Adjust based on business age
    if (metrics.businessAge > 5) rate -= 0.01;
    else if (metrics.businessAge < 2) rate += 0.02;
    
    // Adjust based on industry risk
    if (metrics.industryRisk === 'low') rate -= 0.01;
    else if (metrics.industryRisk === 'high') rate += 0.03;
    
    // Adjust based on loan amount
    if (amount > 100000) rate += 0.01;
    if (amount < 25000) rate -= 0.01;
    
    // Adjust based on term
    if (term > 18) rate += 0.02;
    if (term < 12) rate -= 0.01;
    
    return Math.max(0.08, Math.min(0.35, rate)); // Cap between 8% and 35%
  }

  /**
   * Calculate approval probability
   */
  private calculateApprovalProbability(metrics: BusinessMetrics): number {
    let probability = 0.5; // Base 50%
    
    // Revenue stability
    if (metrics.monthlyRevenue > 50000) probability += 0.2;
    else if (metrics.monthlyRevenue > 20000) probability += 0.1;
    
    // Profit margin
    if (metrics.profitMargin > 0.2) probability += 0.15;
    else if (metrics.profitMargin > 0.1) probability += 0.05;
    
    // Business age
    if (metrics.businessAge > 3) probability += 0.1;
    else if (metrics.businessAge > 1) probability += 0.05;
    
    // Industry risk
    if (metrics.industryRisk === 'low') probability += 0.1;
    else if (metrics.industryRisk === 'high') probability -= 0.2;
    
    return Math.max(0.1, Math.min(0.95, probability));
  }

  /**
   * Generate loan conditions
   */
  private generateLoanConditions(metrics: BusinessMetrics): string[] {
    const conditions: string[] = [];
    
    if (metrics.monthlyRevenue < 10000) {
      conditions.push('Personal guarantee required');
    }
    
    if (metrics.businessAge < 2) {
      conditions.push('Business plan review required');
    }
    
    if (metrics.industryRisk === 'high') {
      conditions.push('Additional collateral required');
    }
    
    if (metrics.debtToIncomeRatio > 0.4) {
      conditions.push('Debt consolidation plan required');
    }
    
    return conditions;
  }

  /**
   * Fetch loan status from lending partner
   */
  private async fetchLoanStatus(applicationId: string): Promise<LoanApplication> {
    const baseUrls = {
      experian: 'https://api.experian.com/v1',
      transunion: 'https://api.transunion.com/v1',
      compuscan: 'https://api.compuscan.co.za/v1',
      xds: 'https://api.xds.co.za/v1',
      clearscore: 'https://api.clearscore.com/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/loan-applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch loan status: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch business credit report
   */
  private async fetchBusinessCreditReport(merchantId: string): Promise<any> {
    const baseUrls = {
      experian: 'https://api.experian.com/v1',
      transunion: 'https://api.transunion.com/v1',
      compuscan: 'https://api.compuscan.co.za/v1',
      xds: 'https://api.xds.co.za/v1',
      clearscore: 'https://api.clearscore.com/v1'
    };

    const baseUrl = baseUrls[this.config.provider];
    
    const response = await fetch(`${baseUrl}/business-credit-report/${merchantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch business credit report: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check if service is authenticated
   */
  isServiceAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}

export default LendingService;
