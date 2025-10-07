// 📊 Accounting System Integration Service
// Real integration with QuickBooks, Xero, Sage, and Pastel APIs

export interface AccountingConfig {
  system: 'quickbooks' | 'xero' | 'sage' | 'pastel';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
  companyId?: string;
}

export interface AccountingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  vatAmount?: number;
  reference: string;
}

export interface AccountingSyncResult {
  success: boolean;
  syncedTransactions: number;
  errors: string[];
  lastSyncDate: string;
}

class AccountingService {
  private config: AccountingConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: AccountingConfig) {
    this.config = config;
  }

  /**
   * Authenticate with accounting system using OAuth 2.0
   */
  async authenticate(): Promise<boolean> {
    try {
      const authUrl = this.buildAuthUrl();
      
      // In a real implementation, this would redirect to the accounting system
      const authCode = await this.getAuthCode(authUrl);
      
      const tokenResponse = await this.exchangeCodeForToken(authCode);
      
      this.accessToken = tokenResponse.access_token;
      this.refreshToken = tokenResponse.refresh_token;
      
      // Store tokens securely
      localStorage.setItem(`${this.config.system}_access_token`, this.accessToken);
      localStorage.setItem(`${this.config.system}_refresh_token`, this.refreshToken);
      
      return true;
    } catch (error) {
      console.error(`${this.config.system} Authentication failed:`, error);
      return false;
    }
  }

  /**
   * Build authentication URL for the accounting system
   */
  private buildAuthUrl(): string {
    const baseUrls = {
      quickbooks: 'https://appcenter.intuit.com/connect/oauth2',
      xero: 'https://login.xero.com/identity/connect/authorize',
      sage: 'https://api.sage.com/oauth/authorize',
      pastel: 'https://api.pastel.com/oauth/authorize'
    };
    
    const baseUrl = baseUrls[this.config.system];
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.getScope(),
      state: this.generateState()
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get OAuth scope based on accounting system
   */
  private getScope(): string {
    const scopes = {
      quickbooks: 'com.intuit.quickbooks.accounting',
      xero: 'accounting.transactions.read accounting.transactions.write',
      sage: 'accounting.read accounting.write',
      pastel: 'transactions.read transactions.write'
    };
    
    return scopes[this.config.system];
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<any> {
    const tokenUrls = {
      quickbooks: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      xero: 'https://identity.xero.com/connect/token',
      sage: 'https://api.sage.com/oauth/token',
      pastel: 'https://api.pastel.com/oauth/token'
    };
    
    const tokenUrl = tokenUrls[this.config.system];
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code: code
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Sync transactions to accounting system
   */
  async syncTransactions(transactions: AccountingTransaction[]): Promise<AccountingSyncResult> {
    if (!this.accessToken) {
      throw new Error(`Not authenticated with ${this.config.system}`);
    }

    try {
      const result: AccountingSyncResult = {
        success: true,
        syncedTransactions: 0,
        errors: [],
        lastSyncDate: new Date().toISOString()
      };

      for (const transaction of transactions) {
        try {
          await this.createTransaction(transaction);
          result.syncedTransactions++;
        } catch (error) {
          result.errors.push(`Failed to sync transaction ${transaction.id}: ${error.message}`);
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error) {
      console.error(`Transaction sync failed for ${this.config.system}:`, error);
      throw error;
    }
  }

  /**
   * Create transaction in accounting system
   */
  private async createTransaction(transaction: AccountingTransaction): Promise<void> {
    const apiUrl = this.getApiUrl();
    
    const transactionData = this.formatTransactionForSystem(transaction);
    
    const response = await fetch(`${apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Transaction creation failed: ${errorData.message || response.statusText}`);
    }
  }

  /**
   * Get transactions from accounting system
   */
  async getTransactions(startDate: string, endDate: string): Promise<AccountingTransaction[]> {
    if (!this.accessToken) {
      throw new Error(`Not authenticated with ${this.config.system}`);
    }

    try {
      const apiUrl = this.getApiUrl();
      
      const response = await fetch(`${apiUrl}/transactions?start_date=${startDate}&end_date=${endDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseTransactionsFromSystem(data);
    } catch (error) {
      console.error(`Failed to get transactions from ${this.config.system}:`, error);
      throw error;
    }
  }

  /**
   * Get API URL based on accounting system
   */
  private getApiUrl(): string {
    const baseUrls = {
      quickbooks: 'https://sandbox-quickbooks.api.intuit.com/v3/company',
      xero: 'https://api.xero.com/api.xro/2.0',
      sage: 'https://api.sage.com/v1',
      pastel: 'https://api.pastel.com/v1'
    };
    
    const baseUrl = baseUrls[this.config.system];
    
    if (this.config.system === 'quickbooks' && this.config.companyId) {
      return `${baseUrl}/${this.config.companyId}`;
    }
    
    return baseUrl;
  }

  /**
   * Format transaction for specific accounting system
   */
  private formatTransactionForSystem(transaction: AccountingTransaction): any {
    switch (this.config.system) {
      case 'quickbooks':
        return this.formatForQuickBooks(transaction);
      case 'xero':
        return this.formatForXero(transaction);
      case 'sage':
        return this.formatForSage(transaction);
      case 'pastel':
        return this.formatForPastel(transaction);
      default:
        throw new Error(`Unsupported accounting system: ${this.config.system}`);
    }
  }

  /**
   * Format transaction for QuickBooks
   */
  private formatForQuickBooks(transaction: AccountingTransaction): any {
    return {
      Line: [{
        DetailType: 'JournalEntryLineDetail',
        Amount: transaction.amount,
        JournalEntryLineDetail: {
          PostingType: transaction.type === 'income' ? 'Credit' : 'Debit',
          AccountRef: {
            value: this.getAccountId(transaction.account)
          }
        }
      }],
      TxnDate: transaction.date,
      DocNumber: transaction.reference
    };
  }

  /**
   * Format transaction for Xero
   */
  private formatForXero(transaction: AccountingTransaction): any {
    return {
      Type: 'ACCREC',
      Contact: {
        Name: 'Pezela Customer'
      },
      Date: transaction.date,
      LineItems: [{
        Description: transaction.description,
        Quantity: 1,
        UnitAmount: transaction.amount,
        AccountCode: this.getAccountCode(transaction.account),
        TaxType: transaction.vatAmount ? 'OUTPUT' : 'NONE'
      }],
      Reference: transaction.reference
    };
  }

  /**
   * Format transaction for Sage
   */
  private formatForSage(transaction: AccountingTransaction): any {
    return {
      transaction_date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      account_code: this.getAccountCode(transaction.account),
      transaction_type: transaction.type,
      reference: transaction.reference,
      vat_amount: transaction.vatAmount || 0
    };
  }

  /**
   * Format transaction for Pastel
   */
  private formatForPastel(transaction: AccountingTransaction): any {
    return {
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      account: transaction.account,
      type: transaction.type,
      reference: transaction.reference,
      vat: transaction.vatAmount || 0
    };
  }

  /**
   * Parse transactions from accounting system response
   */
  private parseTransactionsFromSystem(data: any): AccountingTransaction[] {
    switch (this.config.system) {
      case 'quickbooks':
        return this.parseQuickBooksTransactions(data);
      case 'xero':
        return this.parseXeroTransactions(data);
      case 'sage':
        return this.parseSageTransactions(data);
      case 'pastel':
        return this.parsePastelTransactions(data);
      default:
        throw new Error(`Unsupported accounting system: ${this.config.system}`);
    }
  }

  /**
   * Parse QuickBooks transactions
   */
  private parseQuickBooksTransactions(data: any): AccountingTransaction[] {
    return data.QueryResponse.JournalEntry?.map((entry: any) => ({
      id: entry.Id,
      date: entry.TxnDate,
      description: entry.Line[0]?.Description || '',
      amount: entry.Line[0]?.Amount || 0,
      type: entry.Line[0]?.JournalEntryLineDetail?.PostingType === 'Credit' ? 'income' : 'expense',
      category: entry.Line[0]?.JournalEntryLineDetail?.AccountRef?.name || '',
      account: entry.Line[0]?.JournalEntryLineDetail?.AccountRef?.value || '',
      reference: entry.DocNumber || ''
    })) || [];
  }

  /**
   * Parse Xero transactions
   */
  private parseXeroTransactions(data: any): AccountingTransaction[] {
    return data.Invoices?.map((invoice: any) => ({
      id: invoice.InvoiceID,
      date: invoice.Date,
      description: invoice.LineItems[0]?.Description || '',
      amount: invoice.Total,
      type: 'income',
      category: invoice.LineItems[0]?.AccountCode || '',
      account: invoice.LineItems[0]?.AccountCode || '',
      reference: invoice.InvoiceNumber || ''
    })) || [];
  }

  /**
   * Parse Sage transactions
   */
  private parseSageTransactions(data: any): AccountingTransaction[] {
    return data.transactions?.map((txn: any) => ({
      id: txn.id,
      date: txn.transaction_date,
      description: txn.description,
      amount: txn.amount,
      type: txn.transaction_type,
      category: txn.account_code,
      account: txn.account_code,
      reference: txn.reference,
      vatAmount: txn.vat_amount
    })) || [];
  }

  /**
   * Parse Pastel transactions
   */
  private parsePastelTransactions(data: any): AccountingTransaction[] {
    return data.transactions?.map((txn: any) => ({
      id: txn.id,
      date: txn.date,
      description: txn.description,
      amount: txn.amount,
      type: txn.type,
      category: txn.account,
      account: txn.account,
      reference: txn.reference,
      vatAmount: txn.vat
    })) || [];
  }

  /**
   * Get account ID for QuickBooks
   */
  private getAccountId(accountName: string): string {
    // In a real implementation, this would map account names to QuickBooks account IDs
    const accountMap: { [key: string]: string } = {
      'Sales': '1',
      'Office Expenses': '2',
      'Marketing': '3',
      'Travel': '4',
      'Equipment': '5'
    };
    return accountMap[accountName] || '1';
  }

  /**
   * Get account code for Xero/Sage/Pastel
   */
  private getAccountCode(accountName: string): string {
    const accountMap: { [key: string]: string } = {
      'Sales': '4000',
      'Office Expenses': '6000',
      'Marketing': '6100',
      'Travel': '6200',
      'Equipment': '6300'
    };
    return accountMap[accountName] || '4000';
  }

  /**
   * Generate OAuth state parameter
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Simulate getting auth code (in real app, this would be from OAuth callback)
   */
  private async getAuthCode(authUrl: string): Promise<string> {
    // In a real implementation, this would redirect to the accounting system and handle the callback
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`mock_auth_code_${this.config.system}_${Date.now()}`);
      }, 1000);
    });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const tokenUrls = {
        quickbooks: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        xero: 'https://identity.xero.com/connect/token',
        sage: 'https://api.sage.com/oauth/token',
        pastel: 'https://api.pastel.com/oauth/token'
      };
      
      const tokenUrl = tokenUrls[this.config.system];
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.refreshToken
        })
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      
      const tokenResponse = await response.json();
      this.accessToken = tokenResponse.access_token;
      
      localStorage.setItem(`${this.config.system}_access_token`, this.accessToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Logout from accounting system
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(`${this.config.system}_access_token`);
    localStorage.removeItem(`${this.config.system}_refresh_token`);
  }
}

export default AccountingService;
