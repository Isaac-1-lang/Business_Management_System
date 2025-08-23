import UniversalTransactionService from './universalTransactionService';
import TransactionEngine from './transactionEngine';
import AuditLogService from './auditLogService';
import DataIntegrationService from './dataIntegrationService';

export interface TransactionRequest {
  type: 'sale' | 'purchase' | 'expense' | 'income' | 'salary' | 'capital_contribution' | 'capital_withdrawal' | 'share_issuance' | 'dividend_declaration' | 'dividend_payment' | 'equity_adjustment' | 'asset_acquisition' | 'transfer';
  amount: number;
  description: string;
  date: string;
  payment_method: 'cash' | 'bank' | 'mobile_money' | 'card' | 'cheque';
  payment_status: 'paid' | 'unpaid' | 'partially_paid';
  paid_amount?: number;
  due_date?: string;
  party_name?: string; // Client for sales, Supplier for purchases
  reference_number?: string;
  supporting_documents?: string[];
  additional_data?: any;
}

export interface TransactionResponse {
  success: boolean;
  transaction_id: string;
  accounting_entries: any[];
  errors?: string[];
  warnings?: string[];
}

class UniversalTransactionHandler {
  static async processTransaction(request: TransactionRequest): Promise<TransactionResponse> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let transaction_id = '';
    let accounting_entries: any[] = [];

    try {
      // Step 1: Validate transaction
      const validation = this.validateTransaction(request);
      if (!validation.isValid) {
        return {
          success: false,
          transaction_id: '',
          accounting_entries: [],
          errors: validation.errors
        };
      }

      // Step 2: Create UTS transaction
      const utsTransaction = UniversalTransactionService.createTransaction({
        type: request.type,
        amount: request.amount,
        description: request.description,
        date: request.date,
        payment_method: request.payment_method,
        reference_number: request.reference_number,
        status: 'confirmed',
        ...request.additional_data
      });

      transaction_id = utsTransaction.id;

      // Step 3: Generate specific accounting entries based on transaction type
      accounting_entries = await this.generateAccountingEntries(request, transaction_id);

      // Step 4: Log to audit system
      AuditLogService.logAction({
        action_type: 'create',
        table_name: 'transactions',
        record_id: transaction_id,
        description: `Transaction processed: ${request.type} - ${request.description}`,
        new_data: request
      });

      // Step 5: Trigger data integration sync
      DataIntegrationService.syncAllData();

      return {
        success: true,
        transaction_id,
        accounting_entries,
        warnings
      };

    } catch (error) {
      console.error('Transaction processing error:', error);
      return {
        success: false,
        transaction_id,
        accounting_entries: [],
        errors: [`Failed to process transaction: ${error.message}`]
      };
    }
  }

  private static validateTransaction(request: TransactionRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!request.description || request.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!request.date) {
      errors.push('Date is required');
    }

    if (!request.type) {
      errors.push('Transaction type is required');
    }

    // Additional validation for capital transactions
    if (['capital_contribution', 'capital_withdrawal', 'share_issuance'].includes(request.type)) {
      if (!request.additional_data?.shareholder_id) {
        errors.push('Shareholder ID is required for capital transactions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static async generateAccountingEntries(request: TransactionRequest, transactionId: string): Promise<any[]> {
    const entries: any[] = [];

    try {
      switch (request.type) {
        case 'capital_contribution':
          // Handle capital contributions: Dr Bank/Cash, Cr Share Capital
          await this.handleCapitalContribution(request, entries);
          break;

        case 'capital_withdrawal':
          // Handle capital withdrawals: Dr Owner Drawings, Cr Bank/Cash
          entries.push({
            account: 'Owner Drawings',
            account_code: '3002',
            debit: request.amount,
            description: 'Capital withdrawal by owner'
          });
          entries.push({
            account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
            account_code: request.payment_method === 'cash' ? '1002' : '1001',
            credit: request.amount,
            description: 'Cash paid for capital withdrawal'
          });
          break;

        case 'share_issuance':
          // Handle share issuance with premium handling
          await this.handleShareIssuance(request, entries);
          break;

        case 'dividend_declaration':
          // Handle dividend declaration: Dr Retained Earnings, Cr Dividend Payable
          entries.push({
            account: 'Retained Earnings',
            account_code: '3001',
            debit: request.amount,
            description: 'Dividend declared'
          });
          entries.push({
            account: 'Dividend Payable',
            account_code: '2104',
            credit: request.amount,
            description: 'Dividend payable to shareholders'
          });
          break;

        case 'dividend_payment':
          // Handle dividend payment: Dr Dividend Payable, Cr Bank/Cash
          entries.push({
            account: 'Dividend Payable',
            account_code: '2104',
            debit: request.amount,
            description: 'Dividend payment made'
          });
          entries.push({
            account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
            account_code: request.payment_method === 'cash' ? '1002' : '1001',
            credit: request.amount,
            description: 'Cash paid for dividends'
          });
          break;

        case 'equity_adjustment':
          // Handle equity adjustments
          await this.handleEquityAdjustment(request, entries);
          break;

        case 'sale':
          // Handle sales with credit support
          await this.handleSaleTransaction(request, entries);
          break;

        case 'purchase':
          // Handle purchases with credit support  
          await this.handlePurchaseTransaction(request, entries);
          break;

        case 'salary':
          // Handle salary payments with all deductions
          const grossSalary = request.additional_data?.gross_salary || request.amount;
          const payeTax = request.additional_data?.paye_deduction || 0;
          const rssbEmployee = request.additional_data?.rssb_employee || 0;
          const rssbEmployer = request.additional_data?.rssb_employer || 0;

          entries.push({
            account: 'Salaries & Wages',
            account_code: '5001',
            debit: grossSalary + rssbEmployer,
            description: 'Salary expense including employer contributions'
          });
          entries.push({
            account: 'Cash at Bank',
            account_code: '1001',
            credit: request.amount,
            description: 'Net salary paid'
          });
          if (payeTax > 0) {
            entries.push({
              account: 'PAYE Payable',
              account_code: '2102',
              credit: payeTax,
              description: 'PAYE tax withheld'
            });
          }
          if (rssbEmployee + rssbEmployer > 0) {
            entries.push({
              account: 'RSSB Payable',
              account_code: '2103',
              credit: rssbEmployee + rssbEmployer,
              description: 'RSSB contributions payable'
            });
          }
          break;

        default:
          // Let the existing UTS handle other transaction types
          break;
      }

      // Post entries to Transaction Engine
      if (entries.length > 0) {
        TransactionEngine.postTransaction({
          date: request.date,
          reference: request.reference_number || `REF-${transactionId}`,
          description: request.description,
          source_id: transactionId,
          source_type: this.mapToTransactionEngineType(request.type),
          entries: entries
        });
      }

      return entries;

    } catch (error) {
      console.error('Error generating accounting entries:', error);
      return [];
    }
  }

  private static async handleCapitalContribution(request: TransactionRequest, entries: any[]): Promise<void> {
    const { default: CompanyCapitalService } = await import('./companyCapitalService');
    
    // Add capital contribution to the system
    CompanyCapitalService.addCapitalContribution({
      shareholder_id: request.additional_data.shareholder_id,
      shareholder_name: request.additional_data.shareholder_name,
      amount: request.amount,
      shares_allocated: request.additional_data.shares_allocated || 0,
      contribution_type: request.payment_method === 'cash' ? 'cash' : 'bank_transfer',
      contribution_date: request.date,
      description: request.description,
      status: 'confirmed'
    });

    // Journal entries: Dr Bank/Cash, Cr Share Capital
    entries.push({
      account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
      account_code: request.payment_method === 'cash' ? '1002' : '1001',
      debit: request.amount,
      description: 'Capital contribution received'
    });
    entries.push({
      account: 'Share Capital',
      account_code: '3000',
      credit: request.amount,
      description: `Capital contribution from ${request.additional_data.shareholder_name}`
    });
  }

  private static async handleShareIssuance(request: TransactionRequest, entries: any[]): Promise<void> {
    const shareValue = request.additional_data?.par_value || 1000; // Default par value
    const totalShares = Math.floor(request.amount / shareValue);
    const shareCapital = totalShares * shareValue;
    const sharePremium = request.amount - shareCapital;

    // Journal entries for share issuance
    entries.push({
      account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
      account_code: request.payment_method === 'cash' ? '1002' : '1001',
      debit: request.amount,
      description: 'Share issuance proceeds'
    });
    
    entries.push({
      account: 'Share Capital',
      account_code: '3000',
      credit: shareCapital,
      description: `${totalShares} shares issued at par value`
    });

    if (sharePremium > 0) {
      entries.push({
        account: 'Share Premium',
        account_code: '3001',
        credit: sharePremium,
        description: 'Share premium on issuance'
      });
    }

    // Update capital service
    const { default: CompanyCapitalService } = await import('./companyCapitalService');
    CompanyCapitalService.addCapitalContribution({
      shareholder_id: request.additional_data.shareholder_id,
      shareholder_name: request.additional_data.shareholder_name,
      amount: request.amount,
      shares_allocated: totalShares,
      contribution_type: request.payment_method === 'cash' ? 'cash' : 'bank_transfer',
      contribution_date: request.date,
      description: `Share issuance: ${totalShares} shares`,
      status: 'confirmed'
    });
  }

  private static async handleSaleTransaction(request: TransactionRequest, entries: any[]): Promise<void> {
    const clientName = request.party_name || request.additional_data?.client || 'Customer';

    if (request.payment_status === 'paid') {
      // Paid sale: Dr Bank/Cash, Cr Sales Revenue
      entries.push({
        account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
        account_code: request.payment_method === 'cash' ? '1002' : '1001',
        debit: request.amount,
        description: `Cash sale - ${clientName}`
      });
      entries.push({
        account: 'Sales Revenue',
        account_code: '4001',
        credit: request.amount,
        description: `Sale to ${clientName}`
      });
    } else if (request.payment_status === 'unpaid') {
      // Credit sale: Dr Accounts Receivable, Cr Sales Revenue
      entries.push({
        account: 'Accounts Receivable',
        account_code: '1201',
        debit: request.amount,
        description: `Credit sale - ${clientName}`
      });
      entries.push({
        account: 'Sales Revenue',
        account_code: '4001',
        credit: request.amount,
        description: `Credit sale to ${clientName}`
      });
    } else if (request.payment_status === 'partially_paid') {
      // Partially paid sale: Dr Cash + Accounts Receivable, Cr Sales Revenue
      const paidAmount = request.paid_amount || 0;
      const remainingAmount = request.amount - paidAmount;

      entries.push({
        account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
        account_code: request.payment_method === 'cash' ? '1002' : '1001',
        debit: paidAmount,
        description: `Partial payment - ${clientName}`
      });
      entries.push({
        account: 'Accounts Receivable',
        account_code: '1201',
        debit: remainingAmount,
        description: `Outstanding balance - ${clientName}`
      });
      entries.push({
        account: 'Sales Revenue',
        account_code: '4001',
        credit: request.amount,
        description: `Sale to ${clientName}`
      });
    }
  }

  private static async handlePurchaseTransaction(request: TransactionRequest, entries: any[]): Promise<void> {
    const supplierName = request.party_name || request.additional_data?.supplier || 'Supplier';
    const expenseAccount = request.additional_data?.expense_account || 'General Expenses';
    const expenseAccountCode = request.additional_data?.expense_account_code || '5001';

    if (request.payment_status === 'paid') {
      // Paid purchase: Dr Expense, Cr Bank/Cash
      entries.push({
        account: expenseAccount,
        account_code: expenseAccountCode,
        debit: request.amount,
        description: `Purchase from ${supplierName}`
      });
      entries.push({
        account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
        account_code: request.payment_method === 'cash' ? '1002' : '1001',
        credit: request.amount,
        description: `Cash payment to ${supplierName}`
      });
    } else if (request.payment_status === 'unpaid') {
      // Credit purchase: Dr Expense, Cr Accounts Payable
      entries.push({
        account: expenseAccount,
        account_code: expenseAccountCode,
        debit: request.amount,
        description: `Credit purchase from ${supplierName}`
      });
      entries.push({
        account: 'Accounts Payable',
        account_code: '2201',
        credit: request.amount,
        description: `Amount owed to ${supplierName}`
      });
    } else if (request.payment_status === 'partially_paid') {
      // Partially paid purchase: Dr Expense, Cr Cash + Accounts Payable
      const paidAmount = request.paid_amount || 0;
      const remainingAmount = request.amount - paidAmount;

      entries.push({
        account: expenseAccount,
        account_code: expenseAccountCode,
        debit: request.amount,
        description: `Purchase from ${supplierName}`
      });
      entries.push({
        account: request.payment_method === 'cash' ? 'Petty Cash' : 'Cash at Bank',
        account_code: request.payment_method === 'cash' ? '1002' : '1001',
        credit: paidAmount,
        description: `Partial payment to ${supplierName}`
      });
      entries.push({
        account: 'Accounts Payable',
        account_code: '2201',
        credit: remainingAmount,
        description: `Outstanding balance to ${supplierName}`
      });
    }
  }

  private static async handleEquityAdjustment(request: TransactionRequest, entries: any[]): Promise<void> {
    const adjustmentType = request.additional_data?.adjustment_type || 'correction';
    const fromAccount = request.additional_data?.from_account || 'Retained Earnings';
    const toAccount = request.additional_data?.to_account || 'Equity Adjustment';

    entries.push({
      account: fromAccount,
      account_code: this.getAccountCode(fromAccount),
      debit: request.amount,
      description: `Equity adjustment: ${adjustmentType}`
    });
    
    entries.push({
      account: toAccount,
      account_code: this.getAccountCode(toAccount),
      credit: request.amount,
      description: `Equity adjustment: ${adjustmentType}`
    });
  }

  private static getAccountCode(accountName: string): string {
    const accountCodes: { [key: string]: string } = {
      'Retained Earnings': '3001',
      'Equity Adjustment': '3003',
      'Share Capital': '3000',
      'Share Premium': '3001',
      'Owner Drawings': '3002'
    };
    return accountCodes[accountName] || '3999';
  }

  private static async handleTransfer(request: TransactionRequest, entries: any[]): Promise<void> {
    const fromAccount = request.additional_data?.from_account || 'Cash on Hand';
    const toAccount = request.additional_data?.to_account || 'Bank';
    
    // Journal entries for inter-account transfer: Dr: To Account, Cr: From Account
    entries.push({
      account: toAccount,
      account_code: this.getAccountCodeForTransfer(toAccount),
      debit: request.amount,
      description: `Transfer from ${fromAccount} to ${toAccount}`
    });
    
    entries.push({
      account: fromAccount,
      account_code: this.getAccountCodeForTransfer(fromAccount),
      credit: request.amount,
      description: `Transfer from ${fromAccount} to ${toAccount}`
    });
  }

  private static getAccountCodeForTransfer(accountName: string): string {
    const transferAccountCodes: { [key: string]: string } = {
      'Cash on Hand': '1002',
      'Petty Cash': '1002',
      'Cash at Bank': '1001',
      'Bank': '1001',
      'KCB Bank': '1001',
      'Equity Bank': '1001',
      'MoMo Wallet': '1003',
      'Airtel Money': '1004',
      'Mobile Money': '1003'
    };
    return transferAccountCodes[accountName] || '1000';
  }

  private static mapToTransactionEngineType(transactionType: TransactionRequest['type']): 'invoice' | 'purchase' | 'payroll' | 'asset' | 'payment' | 'manual' {
    const typeMapping: Record<TransactionRequest['type'], 'invoice' | 'purchase' | 'payroll' | 'asset' | 'payment' | 'manual'> = {
      'sale': 'invoice',
      'purchase': 'purchase',
      'expense': 'payment',
      'income': 'invoice',
      'salary': 'payroll',
      'capital_contribution': 'manual',
      'capital_withdrawal': 'manual',
      'share_issuance': 'manual',
      'dividend_declaration': 'manual',
      'dividend_payment': 'payment',
      'equity_adjustment': 'manual',
      'asset_acquisition': 'asset',
      'transfer': 'manual'
    };
    
    return typeMapping[transactionType] || 'manual';
  }

  static async getTransactionHistory(filters?: {
    type?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
  }) {
    // Get all transactions with comprehensive details
    const transactions = UniversalTransactionService.getAllTransactions();
    
    let filtered = transactions;

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(t => t.type === filters.type);
      }
      if (filters.date_from) {
        filtered = filtered.filter(t => t.date >= filters.date_from!);
      }
      if (filters.date_to) {
        filtered = filtered.filter(t => t.date <= filters.date_to!);
      }
      if (filters.amount_min) {
        filtered = filtered.filter(t => t.amount >= filters.amount_min!);
      }
      if (filters.amount_max) {
        filtered = filtered.filter(t => t.amount <= filters.amount_max!);
      }
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static getTransactionSummary() {
    const transactions = UniversalTransactionService.getAllTransactions();
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    return {
      total_transactions: transactions.length,
      total_amount: transactions.reduce((sum, t) => sum + t.amount, 0),
      this_month: {
        count: transactions.filter(t => new Date(t.date) >= thisMonth).length,
        amount: transactions.filter(t => new Date(t.date) >= thisMonth).reduce((sum, t) => sum + t.amount, 0)
      },
      this_year: {
        count: transactions.filter(t => new Date(t.date) >= thisYear).length,
        amount: transactions.filter(t => new Date(t.date) >= thisYear).reduce((sum, t) => sum + t.amount, 0)
      },
      by_type: transactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_payment_method: transactions.reduce((acc, t) => {
        acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default UniversalTransactionHandler;
