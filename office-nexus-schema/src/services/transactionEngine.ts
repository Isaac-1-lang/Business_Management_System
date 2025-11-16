
export interface GLEntry {
  id: string;
  date: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  reference: string;
  description: string;
  source_id: string;
  source_type: 'invoice' | 'purchase' | 'payroll' | 'asset' | 'payment' | 'manual';
  user_id: string;
  created_at: string;
}

export interface Transaction {
  date: string;
  reference: string;
  description: string;
  source_id: string;
  source_type: GLEntry['source_type'];
  entries: {
    account_code: string;
    account_name: string;
    debit?: number;
    credit?: number;
  }[];
}

// Chart of Accounts - UPDATED with missing accounts
export const CHART_OF_ACCOUNTS = {
  // Assets
  '1001': 'Cash at Bank',
  '1002': 'Petty Cash',
  '1003': 'Mobile Money Account',
  '1101': 'Accounts Receivable',
  '1201': 'Inventory',
  '1301': 'Fixed Assets',
  '1302': 'Accumulated Depreciation',
  
  // Liabilities
  '2001': 'Accounts Payable',
  '2004': 'Loans Payable',
  '2101': 'VAT Payable',
  '2102': 'PAYE Payable',
  '2103': 'RSSB Payable',
  '2201': 'Dividend Payable',  // ADDED - was missing
  '2202': 'Accrued Expenses',
  
  // Equity
  '3001': 'Share Capital',
  '3002': 'Retained Earnings',
  
  // Revenue
  '4001': 'Sales Revenue',
  '4002': 'Service Revenue',
  '4003': 'Other Income',
  
  // Expenses
  '5001': 'Salaries & Wages',
  '5002': 'Rent Expense',
  '5003': 'Utilities',
  '5004': 'Marketing',
  '5005': 'Office Supplies',
  '5006': 'Professional Fees',
  '5007': 'Depreciation',
  '5008': 'Other Expenses'
};

import { apiService } from './apiService';

class TransactionEngine {
  private static generalLedger: GLEntry[] = [];
  
  static async refreshGeneralLedger(params?: { startDate?: string; endDate?: string; companyId?: string }): Promise<GLEntry[]> {
    const res = await apiService.getAccountingLedger(params);
    if (res.success && res.data?.ledger) {
      // Backend returns aggregated ledger; keep for compatibility if needed
      // Here we keep a flat cache for simplicity; consumers should read from API when possible
      const ledger = res.data.ledger;
      // Ensure we return an array
      return Array.isArray(ledger) ? ledger as GLEntry[] : [];
    }
    
    // Handle specific error cases
    if (res.error === 'COMPANY_ID_REQUIRED') {
      console.warn('⚠️ Company ID required for ledger. User may need to create or join a company first.');
      return [];
    }
    
    console.warn('Failed to fetch ledger from API:', res.error || res.message);
    return [];
  }

  static async postTransaction(_transaction: Transaction): Promise<void> {
    // Posting individual journal entries is now backend responsibility via transaction creation
    console.warn('TransactionEngine.postTransaction is deprecated; create accounting transactions via API.');
  }
  
  static async getGeneralLedger(params?: { startDate?: string; endDate?: string; companyId?: string }): Promise<GLEntry[]> {
    return this.refreshGeneralLedger(params);
  }
  
  static async getTrialBalance(asOfDate?: string): Promise<{ account_code: string; account_name: string; debit: number; credit: number; balance: number }[]> {
    const res = await apiService.getTrialBalance({ asOfDate });
    if (res.success && res.data?.trialBalance) {
      return res.data.trialBalance;
    }
    console.warn('Failed to fetch trial balance:', res.error || res.message);
    return [];
  }
  
  static async getAccountBalance(accountCode: string, asOfDate?: string): Promise<number> {
    const trial = await this.getTrialBalance(asOfDate);
    const row = trial.find(r => r.account_code === accountCode);
    return row ? row.balance : 0;
  }
  
  static async getAuditTrail(_sourceType?: GLEntry['source_type'], _sourceId?: string): Promise<GLEntry[]> {
    // Not supported via API yet; return empty or implement an endpoint
    console.warn('getAuditTrail via TransactionEngine is not available via API yet.');
    return [];
  }
}

// Helper functions for common transactions
export const TransactionHelpers = {
  createSalesInvoice: (invoiceData: {
    id: string;
    amount: number;
    vatAmount: number;
    client: string;
    date: string;
    invoiceNumber: string;
  }) => {
    const { id, amount, vatAmount, client, date, invoiceNumber } = invoiceData;
    const netAmount = amount - vatAmount;
    
    TransactionEngine.postTransaction({
      date,
      reference: invoiceNumber,
      description: `Sales Invoice - ${client}`,
      source_id: id,
      source_type: 'invoice',
      entries: [
        { account_code: '1101', account_name: 'Accounts Receivable', debit: amount },
        { account_code: '4001', account_name: 'Sales Revenue', credit: netAmount },
        { account_code: '2101', account_name: 'VAT Payable', credit: vatAmount }
      ]
    });
  },
  
  createPurchase: (purchaseData: {
    id: string;
    amount: number;
    vatAmount: number;
    supplier: string;
    date: string;
    reference: string;
  }) => {
    const { id, amount, vatAmount, supplier, date, reference } = purchaseData;
    const netAmount = amount - vatAmount;
    
    TransactionEngine.postTransaction({
      date,
      reference,
      description: `Purchase - ${supplier}`,
      source_id: id,
      source_type: 'purchase',
      entries: [
        { account_code: '5008', account_name: 'Other Expenses', debit: netAmount },
        { account_code: '1002', account_name: 'VAT Input', debit: vatAmount },
        { account_code: '2001', account_name: 'Accounts Payable', credit: amount }
      ]
    });
  },
  
  createPayrollEntry: (payrollData: {
    id: string;
    grossSalary: number;
    payeTax: number;
    rssbEmployee: number;
    rssbEmployer: number;
    netPay: number;
    date: string;
    period: string;
  }) => {
    const { id, grossSalary, payeTax, rssbEmployee, rssbEmployer, netPay, date, period } = payrollData;
    
    TransactionEngine.postTransaction({
      date,
      reference: `PAYROLL-${period}`,
      description: `Payroll for ${period}`,
      source_id: id,
      source_type: 'payroll',
      entries: [
        { account_code: '5001', account_name: 'Salaries & Wages', debit: grossSalary + rssbEmployer },
        { account_code: '1001', account_name: 'Cash at Bank', credit: netPay },
        { account_code: '2102', account_name: 'PAYE Payable', credit: payeTax },
        { account_code: '2103', account_name: 'RSSB Payable', credit: rssbEmployee + rssbEmployer }
      ]
    });
  }
};

export default TransactionEngine;
