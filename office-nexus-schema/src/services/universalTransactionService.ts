import TransactionEngine from './transactionEngine';
import DataIntegrationService from './dataIntegrationService';

export interface UniversalTransaction {
  id: string;
  company_id: string;
  type: 'sale' | 'purchase' | 'expense' | 'income' | 'salary' | 'asset_acquisition' | 'payment';
  amount: number;
  vat?: number;
  description: string;
  date: string;
  payment_method: 'cash' | 'bank' | 'mobile_money' | 'card' | 'cheque';
  reference_number?: string;
  supplier?: string;
  client?: string;
  income_source?: 'sales' | 'loan_creditor' | 'gift_friend' | 'grant_donation' | 'asset_sale' | 'investment_return' | 'other';
  tax_category?: string;
  invoice_number?: string;
  tin?: string;
  phone_number?: string;
  momo_reference?: string;
  employee_id?: string;
  employee_name?: string;
  gross_salary?: number;
  paye_deduction?: number;
  rssb_employee?: number;
  rssb_employer?: number;
  net_salary?: number;
  asset_details?: {
    name: string;
    category: string;
    location: string;
    useful_life_years: number;
    residual_value: number;
    depreciation_method: string;
  };
  status: 'draft' | 'confirmed' | 'cancelled';
  created_at: string;
}

class UniversalTransactionService {
  private static transactions: UniversalTransaction[] = [];

  static loadTransactions(): void {
    const stored = localStorage.getItem('universal-transactions');
    if (stored) {
      this.transactions = JSON.parse(stored);
    }
  }

  static createTransaction(data: Omit<UniversalTransaction, 'id' | 'created_at'> & { company_id?: string }): UniversalTransaction {
    this.loadTransactions();
    
    const transaction: UniversalTransaction = {
      ...data,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      company_id: data.company_id || localStorage.getItem('selectedCompanyId') || 'comp-001',
      created_at: new Date().toISOString()
    };

    this.transactions.push(transaction);
    
    // Auto-post to accounting system
    this.postToAccounting(transaction);
    
    // Store in localStorage for persistence
    localStorage.setItem('universal-transactions', JSON.stringify(this.transactions));
    
    // Notify integration service
    DataIntegrationService.notify('transactions', this.transactions);
    
    console.log('Universal transaction created and posted to accounting:', transaction);
    
    return transaction;
  }

  static getAllTransactions(): UniversalTransaction[] {
    this.loadTransactions();
    const currentCompanyId = localStorage.getItem('selectedCompanyId') || 'comp-001';
    return this.transactions
      .filter(t => t.company_id === currentCompanyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static postTransaction(transaction: UniversalTransaction): void {
    this.transactions.push(transaction);
    this.postToAccounting(transaction);
    localStorage.setItem('universal-transactions', JSON.stringify(this.transactions));
    DataIntegrationService.notify('transactions', this.transactions);
  }

  private static postToAccounting(transaction: UniversalTransaction): void {
    const vatRate = 0.18;
    const reference = transaction.reference_number || transaction.invoice_number || `REF-${transaction.id}`;
    
    try {
      switch (transaction.type) {
        case 'sale':
          const saleVat = transaction.vat || (transaction.amount * vatRate / (1 + vatRate));
          const saleNet = transaction.amount - saleVat;
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'invoice',
            entries: [
              { account_code: '1101', account_name: 'Accounts Receivable', debit: transaction.amount },
              { account_code: '4001', account_name: 'Sales Revenue', credit: saleNet },
              { account_code: '2101', account_name: 'VAT Payable', credit: saleVat }
            ]
          });
          break;

        case 'purchase':
          const purchaseVat = transaction.vat || (transaction.amount * vatRate / (1 + vatRate));
          const purchaseNet = transaction.amount - purchaseVat;
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'purchase',
            entries: [
              { account_code: '5008', account_name: 'Other Expenses', debit: purchaseNet },
              { account_code: '1002', account_name: 'VAT Input', debit: purchaseVat },
              { account_code: '2001', account_name: 'Accounts Payable', credit: transaction.amount }
            ]
          });
          break;

        case 'expense':
          const paymentAccount = this.getPaymentAccount(transaction.payment_method);
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'payment',
            entries: [
              { account_code: '5008', account_name: 'Other Expenses', debit: transaction.amount },
              { account_code: paymentAccount.code, account_name: paymentAccount.name, credit: transaction.amount }
            ]
          });
          break;

        case 'income':
          const incomePaymentAccount = this.getPaymentAccount(transaction.payment_method);
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'payment',
            entries: [
              { account_code: incomePaymentAccount.code, account_name: incomePaymentAccount.name, debit: transaction.amount },
              { account_code: '4003', account_name: 'Other Income', credit: transaction.amount }
            ]
          });
          break;

        case 'salary':
          if (transaction.gross_salary && transaction.net_salary) {
            TransactionEngine.postTransaction({
              date: transaction.date,
              reference: reference,
              description: transaction.description,
              source_id: transaction.id,
              source_type: 'payroll',
              entries: [
                { account_code: '5001', account_name: 'Salaries & Wages', debit: transaction.gross_salary + (transaction.rssb_employer || 0) },
                { account_code: '1001', account_name: 'Cash at Bank', credit: transaction.net_salary },
                { account_code: '2102', account_name: 'PAYE Payable', credit: transaction.paye_deduction || 0 },
                { account_code: '2103', account_name: 'RSSB Payable', credit: (transaction.rssb_employee || 0) + (transaction.rssb_employer || 0) }
              ]
            });
          }
          break;

        case 'asset_acquisition':
          const assetPaymentAccount = this.getPaymentAccount(transaction.payment_method);
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'asset',
            entries: [
              { account_code: '1301', account_name: 'Fixed Assets', debit: transaction.amount },
              { account_code: assetPaymentAccount.code, account_name: assetPaymentAccount.name, credit: transaction.amount }
            ]
          });
          break;

        case 'payment':
          const fromAccount = this.getPaymentAccount(transaction.payment_method);
          
          TransactionEngine.postTransaction({
            date: transaction.date,
            reference: reference,
            description: transaction.description,
            source_id: transaction.id,
            source_type: 'payment',
            entries: [
              { account_code: '2001', account_name: 'Accounts Payable', debit: transaction.amount },
              { account_code: fromAccount.code, account_name: fromAccount.name, credit: transaction.amount }
            ]
          });
          break;
      }
    } catch (error) {
      console.error('Error posting transaction to accounting:', error);
    }
  }

  private static getPaymentAccount(paymentMethod: string): { code: string; name: string } {
    switch (paymentMethod) {
      case 'cash':
        return { code: '1002', name: 'Petty Cash' };
      case 'bank':
        return { code: '1001', name: 'Cash at Bank' };
      case 'mobile_money':
        return { code: '1003', name: 'Mobile Money Account' };
      case 'card':
        return { code: '1001', name: 'Cash at Bank' };
      case 'cheque':
        return { code: '1001', name: 'Cash at Bank' };
      default:
        return { code: '1001', name: 'Cash at Bank' };
    }
  }

  static getTransactionById(id: string): UniversalTransaction | undefined {
    return this.getAllTransactions().find(t => t.id === id);
  }

  static getTransactionsByType(type: UniversalTransaction['type']): UniversalTransaction[] {
    return this.getAllTransactions().filter(t => t.type === type);
  }

  static getTransactionsByDateRange(startDate: string, endDate: string): UniversalTransaction[] {
    return this.getAllTransactions().filter(t => t.date >= startDate && t.date <= endDate);
  }

  static updateTransactionStatus(id: string, status: UniversalTransaction['status']): void {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      transaction.status = status;
      localStorage.setItem('universal-transactions', JSON.stringify(this.transactions));
      DataIntegrationService.notify('transactions', this.transactions);
    }
  }

  static deleteTransaction(id: string): void {
    this.transactions = this.transactions.filter(t => t.id !== id);
    localStorage.setItem('universal-transactions', JSON.stringify(this.transactions));
    DataIntegrationService.notify('transactions', this.transactions);
  }

  static getIncomeBreakdown(fromDate: string, toDate: string): Array<{
    source: string;
    label: string;
    amount: number;
    percentage: number;
    count: number;
  }> {
    const incomeTransactions = this.getAllTransactions().filter(
      t => (t.type === 'sale' || t.type === 'income') && 
           t.date >= fromDate && t.date <= toDate
    );

    const totalAmount = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const breakdown = new Map();
    
    incomeTransactions.forEach(t => {
      const source = t.type === 'sale' ? 'sales' : (t.income_source || 'other');
      const current = breakdown.get(source) || { amount: 0, count: 0 };
      breakdown.set(source, {
        amount: current.amount + t.amount,
        count: current.count + 1
      });
    });

    const labels: { [key: string]: string } = {
      'sales': 'Sales Revenue',
      'loan_creditor': 'Loan from Creditor',
      'gift_friend': 'Gift from Friend',
      'grant_donation': 'Grant/Donation',
      'asset_sale': 'Asset Sale',
      'investment_return': 'Investment Return',
      'other': 'Other Income'
    };

    return Array.from(breakdown.entries()).map(([source, data]) => ({
      source,
      label: labels[source] || source,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);
  }

  static getPaymentMethodSummary(fromDate: string, toDate: string): Array<{
    method: string;
    count: number;
    totalAmount: number;
  }> {
    const transactions = this.getAllTransactions().filter(
      t => t.date >= fromDate && t.date <= toDate
    );

    const summary = new Map();
    
    transactions.forEach(t => {
      const methodLabels: { [key: string]: string } = {
        'cash': 'Cash',
        'bank': 'Bank Transfer',
        'mobile_money': 'MTN Mobile Money',
        'card': 'Card Payment',
        'cheque': 'Cheque'
      };
      
      const method = methodLabels[t.payment_method] || t.payment_method;
      const current = summary.get(method) || { count: 0, totalAmount: 0 };
      summary.set(method, {
        count: current.count + 1,
        totalAmount: current.totalAmount + t.amount
      });
    });

    return Array.from(summary.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      totalAmount: data.totalAmount
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  static getTaxCategorySummary(fromDate: string, toDate: string): Array<{
    category: string;
    label: string;
    amount: number;
    count: number;
    percentage: number;
    deductible: boolean;
  }> {
    const expenseTransactions = this.getAllTransactions().filter(
      t => (t.type === 'expense' || t.type === 'purchase') && 
           t.date >= fromDate && t.date <= toDate
    );

    const totalAmount = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const summary = new Map();
    
    expenseTransactions.forEach(t => {
      const category = t.tax_category || 'general_expense';
      const current = summary.get(category) || { amount: 0, count: 0 };
      summary.set(category, {
        amount: current.amount + t.amount,
        count: current.count + 1
      });
    });

    const categoryLabels: { [key: string]: { label: string; deductible: boolean } } = {
      'general_expense': { label: 'General Business Expenses', deductible: true },
      'office_supplies': { label: 'Office Supplies', deductible: true },
      'travel_expense': { label: 'Travel & Transport', deductible: true },
      'utilities': { label: 'Utilities', deductible: true },
      'professional_fees': { label: 'Professional Fees', deductible: true },
      'entertainment': { label: 'Entertainment', deductible: false },
      'personal_expense': { label: 'Personal Expenses', deductible: false }
    };

    return Array.from(summary.entries()).map(([category, data]) => {
      const info = categoryLabels[category] || { label: category, deductible: true };
      return {
        category,
        label: info.label,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        deductible: info.deductible
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  static postMonthlyDepreciation(month: string): void {
    // This would typically calculate and post depreciation entries
    // For now, we'll create a placeholder transaction
    this.createTransaction({
      type: 'expense',
      amount: 0, // Would be calculated based on assets
      description: `Monthly Depreciation - ${month}`,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'bank',
      status: 'confirmed',
      tax_category: 'depreciation',
      company_id: localStorage.getItem('selectedCompanyId') || 'comp-001'
    });
  }
}

export default UniversalTransactionService;
