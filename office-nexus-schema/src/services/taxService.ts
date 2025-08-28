import TransactionEngine from './transactionEngine';
import AccountingService from './accountingService';

export interface VATReturn {
  period: string;
  sales_vat: number;
  purchase_vat: number;
  net_vat_payable: number;
  total_sales: number;
  total_purchases: number;
  transactions: {
    sales: any[];
    purchases: any[];
  };
}

export interface PAYEReturn {
  period: string;
  total_gross_salary: number;
  total_paye: number;
  total_rssb: number;
  employees: {
    name: string;
    gross_salary: number;
    paye: number;
    rssb_employee: number;
    net_pay: number;
  }[];
}

export interface CITReturn {
  year: string;
  turnover: number;
  total_expenses: number;
  profit: number;
  cit_payable: number;
  tax_rate: number;
  breakdown: {
    revenue_accounts: any[];
    expense_accounts: any[];
  };
}

export interface QITReturn {
  quarter: string;
  year: string;
  estimated_income: number;
  tax_rate: number;
  tax_amount: number;
  paid: boolean;
  paid_date?: string;
  rra_proof_file?: string;
  due_date: string;
}

export interface TaxSummary {
  vat_due: number;
  paye_due: number;
  cit_due: number;
  qit_due: number;
  next_filing_dates: {
    vat: string;
    paye: string;
    cit: string;
    qit: string;
  };
}

class TaxService {
  // Empty array - replace with actual API calls in production
  private static qitPayments: QITReturn[] = [];

  // VAT Return Generation
  static generateVATReturn(month: string): VATReturn {
    const startDate = `${month}-01`;
    const endDate = new Date(month + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const glEntries = TransactionEngine.getGeneralLedger().filter(
      entry => entry.date >= startDate && entry.date <= endDateStr
    );
    
    // Sales VAT (Output VAT - VAT Payable account)
    const salesVATEntries = glEntries.filter(
      entry => entry.account_code === '2101' && entry.source_type === 'invoice'
    );
    const sales_vat = salesVATEntries.reduce((sum, entry) => sum + entry.credit, 0);
    
    // Purchase VAT (Input VAT - VAT Input account)
    const purchaseVATEntries = glEntries.filter(
      entry => entry.account_code === '1002' && 
      (entry.source_type === 'purchase' || entry.source_type === 'manual')
    );
    const purchase_vat = purchaseVATEntries.reduce((sum, entry) => sum + entry.debit, 0);
    
    // Sales and Purchase totals
    const salesEntries = glEntries.filter(
      entry => entry.account_code === '4001' && entry.source_type === 'invoice'
    );
    const total_sales = salesEntries.reduce((sum, entry) => sum + entry.credit, 0);
    
    const purchaseEntries = glEntries.filter(
      entry => entry.account_code === '5008' && entry.source_type === 'purchase'
    );
    const total_purchases = purchaseEntries.reduce((sum, entry) => sum + entry.debit, 0);
    
    return {
      period: month,
      sales_vat,
      purchase_vat,
      net_vat_payable: sales_vat - purchase_vat,
      total_sales,
      total_purchases,
      transactions: {
        sales: salesVATEntries,
        purchases: purchaseVATEntries
      }
    };
  }
  
  // PAYE Return Generation
  static generatePAYEReturn(month: string): PAYEReturn {
    const startDate = `${month}-01`;
    const endDate = new Date(month + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const payrollEntries = TransactionEngine.getGeneralLedger().filter(
      entry => entry.date >= startDate && 
               entry.date <= endDateStr && 
               entry.source_type === 'payroll'
    );
    
    // Get PAYE entries
    const payeEntries = payrollEntries.filter(entry => entry.account_code === '2102');
    const total_paye = payeEntries.reduce((sum, entry) => sum + entry.credit, 0);
    
    // Get RSSB entries
    const rssbEntries = payrollEntries.filter(entry => entry.account_code === '2103');
    const total_rssb = rssbEntries.reduce((sum, entry) => sum + entry.credit, 0);
    
    // Get Gross Salary entries
    const salaryEntries = payrollEntries.filter(entry => entry.account_code === '5001');
    const total_gross_salary = salaryEntries.reduce((sum, entry) => sum + entry.debit, 0);
    
    // Mock employee breakdown (in real system, this would come from payroll records)
    const employees = [
      {
        name: "Employee 1",
        gross_salary: total_gross_salary * 0.3,
        paye: total_paye * 0.3,
        rssb_employee: total_rssb * 0.3 * 0.6, // 60% is employee contribution
        net_pay: (total_gross_salary * 0.3) - (total_paye * 0.3) - (total_rssb * 0.3 * 0.6)
      },
      {
        name: "Employee 2",
        gross_salary: total_gross_salary * 0.4,
        paye: total_paye * 0.4,
        rssb_employee: total_rssb * 0.4 * 0.6,
        net_pay: (total_gross_salary * 0.4) - (total_paye * 0.4) - (total_rssb * 0.4 * 0.6)
      },
      {
        name: "Employee 3",
        gross_salary: total_gross_salary * 0.3,
        paye: total_paye * 0.3,
        rssb_employee: total_rssb * 0.3 * 0.6,
        net_pay: (total_gross_salary * 0.3) - (total_paye * 0.3) - (total_rssb * 0.3 * 0.6)
      }
    ].filter(emp => emp.gross_salary > 0);
    
    return {
      period: month,
      total_gross_salary,
      total_paye,
      total_rssb,
      employees
    };
  }
  
  // CIT Return Generation
  static generateCITReturn(year: string): CITReturn {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const glEntries = TransactionEngine.getGeneralLedger().filter(
      entry => entry.date >= startDate && entry.date <= endDate
    );
    
    // Revenue (4xxx accounts)
    const revenueEntries = glEntries.filter(entry => entry.account_code.startsWith('4'));
    const turnover = revenueEntries.reduce((sum, entry) => sum + entry.credit, 0);
    
    // Expenses (5xxx accounts)
    const expenseEntries = glEntries.filter(entry => entry.account_code.startsWith('5'));
    const total_expenses = expenseEntries.reduce((sum, entry) => sum + entry.debit, 0);
    
    const profit = turnover - total_expenses;
    const tax_rate = 0.30; // 30% CIT rate in Rwanda
    const cit_payable = Math.max(0, profit * tax_rate);
    
    // Group revenue and expense accounts
    const revenue_accounts = this.groupAccountsByCode(revenueEntries);
    const expense_accounts = this.groupAccountsByCode(expenseEntries);
    
    return {
      year,
      turnover,
      total_expenses,
      profit,
      cit_payable,
      tax_rate,
      breakdown: {
        revenue_accounts,
        expense_accounts
      }
    };
  }

  // QIT Return Generation
  static generateQITReturn(quarter: string, year: string): QITReturn {
    const existingQIT = this.qitPayments.find(
      qit => qit.quarter === quarter && qit.year === year
    );

    if (existingQIT) {
      return existingQIT;
    }

    // Create new QIT entry if not found
    const newQIT: QITReturn = {
      quarter,
      year,
      estimated_income: 0,
      tax_rate: 30,
      tax_amount: 0,
      paid: false,
      due_date: this.getQITDueDate(quarter, year)
    };

    return newQIT;
  }

  // Get all QIT payments for a year
  static getQITPayments(year: string): QITReturn[] {
    return this.qitPayments.filter(qit => qit.year === year);
  }

  // Record QIT payment
  static recordQITPayment(qitData: Omit<QITReturn, 'tax_amount' | 'due_date'>): QITReturn {
    const tax_amount = (qitData.estimated_income * qitData.tax_rate) / 100;
    const due_date = this.getQITDueDate(qitData.quarter, qitData.year);

    const existingIndex = this.qitPayments.findIndex(
      qit => qit.quarter === qitData.quarter && qit.year === qitData.year
    );

    const qitRecord: QITReturn = {
      ...qitData,
      tax_amount,
      due_date
    };

    if (existingIndex >= 0) {
      this.qitPayments[existingIndex] = qitRecord;
    } else {
      this.qitPayments.push(qitRecord);
    }

    return qitRecord;
  }

  // Get QIT due date based on quarter
  private static getQITDueDate(quarter: string, year: string): string {
    const quarterDates = {
      'Q1': `${year}-03-31`,
      'Q2': `${year}-06-30`,
      'Q3': `${year}-09-30`,
      'Q4': `${year}-12-31`
    };
    return quarterDates[quarter as keyof typeof quarterDates] || `${year}-12-31`;
  }
  
  // Get current quarter
  static getCurrentQuarter(): string {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }
  
  // Get Tax Summary Dashboard
  static getTaxSummary(): TaxSummary {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const currentYear = currentDate.getFullYear().toString();
    const currentQuarter = this.getCurrentQuarter();
    
    const vatReturn = this.generateVATReturn(currentMonth);
    const payeReturn = this.generatePAYEReturn(currentMonth);
    const citReturn = this.generateCITReturn(currentYear);
    const qitReturn = this.generateQITReturn(currentQuarter, currentYear);
    
    // Calculate next filing dates
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const vatDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);
    const payeDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15);
    const citDueDate = new Date(currentDate.getFullYear() + 1, 2, 31); // March 31st
    const qitDueDate = new Date(qitReturn.due_date);
    
    return {
      vat_due: Math.max(0, vatReturn.net_vat_payable),
      paye_due: payeReturn.total_paye,
      cit_due: citReturn.cit_payable,
      qit_due: qitReturn.paid ? 0 : qitReturn.tax_amount,
      next_filing_dates: {
        vat: vatDueDate.toISOString().split('T')[0],
        paye: payeDueDate.toISOString().split('T')[0],
        cit: citDueDate.toISOString().split('T')[0],
        qit: qitReturn.due_date
      }
    };
  }
  
  // Helper method to group GL entries by account
  private static groupAccountsByCode(entries: any[]): any[] {
    const grouped = entries.reduce((acc, entry) => {
      const key = entry.account_code;
      if (!acc[key]) {
        acc[key] = {
          account_code: entry.account_code,
          account_name: entry.account_name,
          total_debit: 0,
          total_credit: 0,
          balance: 0,
          entries: []
        };
      }
      acc[key].total_debit += entry.debit;
      acc[key].total_credit += entry.credit;
      acc[key].balance = acc[key].total_debit - acc[key].total_credit;
      acc[key].entries.push(entry);
      return acc;
    }, {} as any);
    
    return Object.values(grouped);
  }
  
  // Format currency for RWF
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  // Calculate days until filing deadline
  static getDaysUntilDeadline(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default TaxService;
