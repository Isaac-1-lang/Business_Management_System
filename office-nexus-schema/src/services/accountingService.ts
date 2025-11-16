
import TransactionEngine, { TransactionHelpers } from './transactionEngine';

export interface InvoiceData {
  id: string;
  number: string;
  client: string;
  amount: number;
  date: string;
  vatRate?: number;
}

export interface PurchaseData {
  id: string;
  reference: string;
  supplier: string;
  amount: number;
  date: string;
  vatRate?: number;
}

export interface PayrollData {
  id: string;
  period: string;
  employees: {
    name: string;
    grossSalary: number;
    payeTax: number;
    rssbEmployee: number;
  }[];
  date: string;
  rssbEmployerRate?: number;
}

class AccountingService {
  static recordSalesInvoice(invoiceData: InvoiceData): void {
    const vatRate = invoiceData.vatRate || 0.18;
    const vatAmount = invoiceData.amount * vatRate / (1 + vatRate);
    
    TransactionHelpers.createSalesInvoice({
      id: invoiceData.id,
      amount: invoiceData.amount,
      vatAmount: vatAmount,
      client: invoiceData.client,
      date: invoiceData.date,
      invoiceNumber: invoiceData.number
    });
  }
  
  static recordPurchase(purchaseData: PurchaseData): void {
    const vatRate = purchaseData.vatRate || 0.18;
    const vatAmount = purchaseData.amount * vatRate / (1 + vatRate);
    
    TransactionHelpers.createPurchase({
      id: purchaseData.id,
      amount: purchaseData.amount,
      vatAmount: vatAmount,
      supplier: purchaseData.supplier,
      date: purchaseData.date,
      reference: purchaseData.reference
    });
  }
  
  static recordPayroll(payrollData: PayrollData): void {
    const rssbEmployerRate = payrollData.rssbEmployerRate || 0.05;
    
    const totals = payrollData.employees.reduce((acc, emp) => ({
      grossSalary: acc.grossSalary + emp.grossSalary,
      payeTax: acc.payeTax + emp.payeTax,
      rssbEmployee: acc.rssbEmployee + emp.rssbEmployee,
      rssbEmployer: acc.rssbEmployer + (emp.grossSalary * rssbEmployerRate)
    }), { grossSalary: 0, payeTax: 0, rssbEmployee: 0, rssbEmployer: 0 });
    
    const netPay = totals.grossSalary - totals.payeTax - totals.rssbEmployee;
    
    TransactionHelpers.createPayrollEntry({
      id: payrollData.id,
      grossSalary: totals.grossSalary,
      payeTax: totals.payeTax,
      rssbEmployee: totals.rssbEmployee,
      rssbEmployer: totals.rssbEmployer,
      netPay: netPay,
      date: payrollData.date,
      period: payrollData.period
    });
  }
  
  static async getTrialBalance(asOfDate?: string, companyId?: string) {
    return await TransactionEngine.getTrialBalance(asOfDate, companyId);
  }
  
  static async getGeneralLedger(params?: { startDate?: string; endDate?: string; companyId?: string }) {
    return await TransactionEngine.getGeneralLedger(params);
  }
  
  static async getAccountBalance(accountCode: string, asOfDate?: string, companyId?: string) {
    return await TransactionEngine.getAccountBalance(accountCode, asOfDate, companyId);
  }

  static async getFinancialSummary(companyId?: string) {
    const trialBalance = await this.getTrialBalance(undefined, companyId);
    
    // Ensure trialBalance is an array
    if (!Array.isArray(trialBalance)) {
      console.warn('⚠️ Trial balance is not an array:', trialBalance);
      return {
        revenue: 0,
        expenses: 0,
        profit: 0,
        assets: 0,
        liabilities: 0,
        equity: 0
      };
    }
    
    const revenue = trialBalance
      .filter(acc => acc.account_code && acc.account_code.startsWith('4'))
      .reduce((sum, acc) => sum + (acc.credit || 0), 0);
    
    const expenses = trialBalance
      .filter(acc => acc.account_code && acc.account_code.startsWith('5'))
      .reduce((sum, acc) => sum + (acc.debit || 0), 0);
    
    const assets = trialBalance
      .filter(acc => acc.account_code && acc.account_code.startsWith('1'))
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    const liabilities = trialBalance
      .filter(acc => acc.account_code && acc.account_code.startsWith('2'))
      .reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0);
    
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      assets,
      liabilities,
      equity: assets - liabilities
    };
  }
  
  static async getVATReport(fromDate: string, toDate: string, companyId?: string) {
    const glEntries = await this.getGeneralLedger({ startDate: fromDate, endDate: toDate, companyId });
    
    // Ensure glEntries is an array
    if (!Array.isArray(glEntries)) {
      console.warn('⚠️ General ledger is not an array:', glEntries);
      return {
        vatPayable: 0,
        vatInput: 0,
        vatDue: 0,
        period: `${fromDate} to ${toDate}`
      };
    }
    
    const filteredEntries = glEntries.filter(
      entry => entry.date >= fromDate && entry.date <= toDate
    );
    
    const vatPayable = filteredEntries
      .filter(entry => entry.account_code === '2101' && entry.source_type === 'invoice')
      .reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    const vatInput = filteredEntries
      .filter(entry => entry.account_code === '1002' && entry.source_type === 'purchase')
      .reduce((sum, entry) => sum + (entry.debit || 0), 0);
    
    return {
      vatPayable,
      vatInput,
      vatDue: vatPayable - vatInput,
      period: `${fromDate} to ${toDate}`
    };
  }
}

export default AccountingService;
