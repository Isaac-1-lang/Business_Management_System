
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

class TransactionEngine {
  private static generalLedger: GLEntry[] = [];
  
  static loadGeneralLedger(): void {
    const stored = localStorage.getItem('general-ledger');
    if (stored) {
      this.generalLedger = JSON.parse(stored);
    }
  }

  static saveGeneralLedger(): void {
    localStorage.setItem('general-ledger', JSON.stringify(this.generalLedger));
  }

  static postTransaction(transaction: Transaction): void {
    this.loadGeneralLedger();
    
    const { date, reference, description, source_id, source_type, entries } = transaction;
    
    // Validate entries balance
    const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Transaction does not balance: Debits must equal Credits');
    }
    
    // Check for duplicate source transactions
    const existingTransaction = this.generalLedger.find(
      entry => entry.source_id === source_id && entry.source_type === source_type
    );
    
    if (existingTransaction) {
      console.warn(`Transaction already exists for ${source_type} ${source_id}`);
      return;
    }
    
    // Post entries to general ledger
    entries.forEach(entry => {
      const glEntry: GLEntry = {
        id: `GL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date,
        account_code: entry.account_code,
        account_name: entry.account_name || CHART_OF_ACCOUNTS[entry.account_code] || 'Unknown Account',
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        reference,
        description,
        source_id,
        source_type,
        user_id: 'current-user', // Would come from auth context
        created_at: new Date().toISOString()
      };
      
      this.generalLedger.push(glEntry);
    });
    
    this.saveGeneralLedger();
    console.log(`Posted ${entries.length} entries to General Ledger for ${source_type} ${source_id}`);
  }
  
  static getGeneralLedger(): GLEntry[] {
    this.loadGeneralLedger();
    return [...this.generalLedger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  static getTrialBalance(asOfDate?: string): { account_code: string; account_name: string; debit: number; credit: number; balance: number }[] {
    this.loadGeneralLedger();
    const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();
    
    const balances = new Map<string, { account_name: string; debit: number; credit: number }>();
    
    this.generalLedger
      .filter(entry => new Date(entry.date) <= cutoffDate)
      .forEach(entry => {
        const existing = balances.get(entry.account_code) || { 
          account_name: entry.account_name, 
          debit: 0, 
          credit: 0 
        };
        
        existing.debit += entry.debit;
        existing.credit += entry.credit;
        balances.set(entry.account_code, existing);
      });
    
    return Array.from(balances.entries())
      .map(([account_code, data]) => ({
        account_code,
        account_name: data.account_name,
        debit: data.debit,
        credit: data.credit,
        balance: data.debit - data.credit
      }))
      .sort((a, b) => a.account_code.localeCompare(b.account_code));
  }
  
  static getAccountBalance(accountCode: string, asOfDate?: string): number {
    this.loadGeneralLedger();
    const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();
    
    const entries = this.generalLedger.filter(
      entry => entry.account_code === accountCode && new Date(entry.date) <= cutoffDate
    );
    
    return entries.reduce((balance, entry) => balance + entry.debit - entry.credit, 0);
  }
  
  static getAuditTrail(sourceType?: GLEntry['source_type'], sourceId?: string): GLEntry[] {
    this.loadGeneralLedger();
    return this.generalLedger.filter(entry => {
      if (sourceType && entry.source_type !== sourceType) return false;
      if (sourceId && entry.source_id !== sourceId) return false;
      return true;
    });
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
