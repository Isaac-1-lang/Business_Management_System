import AccountingService from './accountingService';
import UniversalTransactionService from './universalTransactionService';
import CapitalService from './capitalService';
import TransactionEngine from './transactionEngine';
import CompanyCapitalService from './companyCapitalService';
import BeneficialOwnerService from './beneficialOwnerService';
import DividendService from './dividendService';
import AuditLogService from './auditLogService';

export interface DataRelationship {
  sourceModule: string;
  sourceId: string;
  targetModule: string;
  targetId: string;
  relationType: 'payment' | 'invoice' | 'payroll' | 'asset' | 'capital' | 'shareholder' | 'beneficial_owner' | 'dividend';
}

export interface IntegratedData {
  directors: any[];
  employees: any[];
  transactions: any[];
  assets: any[];
  capitalEntries: any[];
  invoices: any[];
  contracts: any[];
  companyCapital: any;
  shareholders: any[];
  beneficialOwners: any[];
  dividends: any[];
  ownershipMappings: any[];
}

class DataIntegrationService {
  private static relationships: DataRelationship[] = [];
  private static listeners: Map<string, Function[]> = new Map();

  // Subscribe to data changes
  static subscribe(module: string, callback: Function) {
    if (!this.listeners.has(module)) {
      this.listeners.set(module, []);
    }
    this.listeners.get(module)!.push(callback);
  }

  // Notify subscribers of data changes
  static notify(module: string, data: any) {
    const callbacks = this.listeners.get(module) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Create relationship between data entities
  static createRelationship(relationship: DataRelationship) {
    this.relationships.push(relationship);
    this.notify('relationships', this.relationships);
  }

  // Get current company ID
  private static getCurrentCompanyId(): string {
    return localStorage.getItem('selectedCompanyId') || 'comp-001';
  }

  // Get all integrated data for a company
  static getIntegratedData(): IntegratedData {
    const directors = this.getDirectorsData();
    const employees = this.getEmployeesData();
    const transactions = UniversalTransactionService.getAllTransactions();
    const assets = this.getAssetsData();
    const capitalEntries = CapitalService.getAllCapitalEntries();
    const invoices = this.getInvoicesData();
    const contracts = this.getContractsData();
    
    // New integrated data
    const companyCapital = CompanyCapitalService.getCompanyCapital();
    const shareholders = CompanyCapitalService.getAllShareholders();
    const beneficialOwners = BeneficialOwnerService.getAllBeneficialOwners();
    const dividends = DividendService.getAllDeclarations();
    const ownershipMappings = BeneficialOwnerService.getOwnershipMappings();

    return {
      directors,
      employees,
      transactions,
      assets,
      capitalEntries,
      invoices,
      contracts,
      companyCapital,
      shareholders,
      beneficialOwners,
      dividends,
      ownershipMappings
    };
  }

  // Directors & Shareholders integration
  static getDirectorsData() {
    const stored = localStorage.getItem('directors-shareholders');
    return stored ? JSON.parse(stored) : [];
  }

  static updateDirectorData(director: any) {
    const directors = this.getDirectorsData();
    const updated = directors.map((d: any) => d.id === director.id ? director : d);
    localStorage.setItem('directors-shareholders', JSON.stringify(updated));
    
    // Update related capital entries
    if (director.shares) {
      this.syncDirectorToCapital(director);
    }
    
    this.notify('directors', updated);
  }

  // Enhanced director sync with capital and beneficial ownership
  static syncDirectorToCapital(director: any) {
    // Create capital entry if director has shares
    const existingEntry = CapitalService.getAllCapitalEntries().find(
      entry => entry.shareholder_id === director.id
    );

    if (!existingEntry && parseFloat(director.shares) > 0) {
      const companyCapital = CompanyCapitalService.getCompanyCapital();
      const shareValue = companyCapital ? companyCapital.share_price : 10000;
      
      CapitalService.addCapitalEntry({
        shareholder_id: director.id,
        shareholder_name: director.name,
        amount: parseFloat(director.shares) * shareValue,
        date_contributed: director.joinDate || new Date().toISOString().split('T')[0],
        method: 'cash',
        description: `Initial shareholding - ${director.shares} shares`,
        type: 'contribution',
        status: 'confirmed',
        created_by: 'system'
      });

      // Add to company capital service as well
      CompanyCapitalService.addCapitalContribution({
        shareholder_id: director.nationalId,
        shareholder_name: director.name,
        amount: parseFloat(director.shares) * shareValue,
        shares_allocated: parseFloat(director.shares),
        contribution_type: 'cash',
        contribution_date: director.joinDate || new Date().toISOString().split('T')[0],
        description: `Initial capital contribution for ${director.shares} shares`,
        status: 'confirmed'
      });
    }

    // Auto-create beneficial owner if they own significant shares (>25%)
    const companyCapital = CompanyCapitalService.getCompanyCapital();
    if (companyCapital) {
      const ownershipPercent = (parseFloat(director.shares) / companyCapital.authorized_shares) * 100;
      
      if (ownershipPercent >= 25) {
        const existingBO = BeneficialOwnerService.getAllBeneficialOwners()
          .find(bo => bo.linked_shareholder_ids.includes(director.id.toString()));
        
        if (!existingBO) {
          BeneficialOwnerService.addBeneficialOwner({
            full_name: director.name,
            nationality: director.nationality || 'Rwandan',
            id_number: director.nationalId,
            relationship_to_company: 'direct_owner',
            ownership_percentage: ownershipPercent,
            control_percentage: ownershipPercent,
            has_significant_control: ownershipPercent >= 25,
            control_nature: ['voting_rights', 'share_ownership'],
            linked_shareholder_ids: [director.id.toString()],
            address: 'Not specified',
            document_urls: [],
            verification_status: 'pending'
          });
        }
      }
    }

    // Log audit trail
    AuditLogService.logAction({
      action_type: 'update',
      table_name: 'directors_shareholders',
      record_id: director.id.toString(),
      description: `Director/Shareholder data synced with capital and beneficial ownership systems`,
      new_data: director
    });
  }

  // Employee data integration
  static getEmployeesData() {
    const stored = localStorage.getItem('employees');
    return stored ? JSON.parse(stored) : [];
  }

  static syncEmployeeToPayroll(employee: any) {
    // When employee is added/updated, sync with payroll system
    const payrollData = {
      employee_id: employee.id,
      employee_name: employee.fullName,
      basic_salary: employee.salary,
      position: employee.position,
      department: employee.department,
      status: employee.status
    };

    // Store in payroll records
    const payrollRecords = JSON.parse(localStorage.getItem('payroll-records') || '[]');
    const existingIndex = payrollRecords.findIndex((p: any) => p.employee_id === employee.id);
    
    if (existingIndex >= 0) {
      payrollRecords[existingIndex] = { ...payrollRecords[existingIndex], ...payrollData };
    } else {
      payrollRecords.push(payrollData);
    }
    
    localStorage.setItem('payroll-records', JSON.stringify(payrollRecords));
    this.notify('payroll', payrollRecords);
  }

  // Enhanced capital contribution sync
  static syncCapitalContribution(contribution: any) {
    // Post to accounting system
    UniversalTransactionService.createTransaction({
      type: 'income',
      amount: contribution.amount,
      description: `Capital contribution from ${contribution.shareholder_name}`,
      date: contribution.contribution_date,
      payment_method: contribution.contribution_type === 'cash' ? 'cash' : 'bank',
      income_source: 'investment_return',
      status: contribution.status,
      company_id: this.getCurrentCompanyId()
    });

    // Update shareholder record
    const shareholders = CompanyCapitalService.getAllShareholders();
    const shareholder = shareholders.find(s => s.national_id === contribution.shareholder_id);
    
    if (shareholder) {
      // Update beneficial ownership if significant
      const companyCapital = CompanyCapitalService.getCompanyCapital();
      if (companyCapital) {
        const ownershipPercent = (shareholder.shares_held / companyCapital.authorized_shares) * 100;
        
        if (ownershipPercent >= 25) {
          this.syncShareholderToBeneficialOwner(shareholder, ownershipPercent);
        }
      }
    }

    AuditLogService.logAction({
      action_type: 'create',
      table_name: 'capital_contributions',
      record_id: contribution.id,
      description: `Capital contribution recorded and synced to accounting`,
      new_data: contribution
    });
  }

  // Sync shareholder to beneficial owner
  static syncShareholderToBeneficialOwner(shareholder: any, ownershipPercent: number) {
    const existingBO = BeneficialOwnerService.getAllBeneficialOwners()
      .find(bo => bo.linked_shareholder_ids.includes(shareholder.id));
    
    if (existingBO) {
      // Update existing beneficial owner
      BeneficialOwnerService.updateBeneficialOwner(existingBO.id, {
        ownership_percentage: ownershipPercent,
        control_percentage: ownershipPercent,
        has_significant_control: ownershipPercent >= 25
      });
    } else if (ownershipPercent >= 25) {
      // Create new beneficial owner
      BeneficialOwnerService.addBeneficialOwner({
        full_name: shareholder.name,
        nationality: shareholder.nationality || 'Rwandan',
        id_number: shareholder.national_id,
        relationship_to_company: 'direct_owner',
        ownership_percentage: ownershipPercent,
        control_percentage: ownershipPercent,
        has_significant_control: true,
        control_nature: ['voting_rights', 'share_ownership'],
        linked_shareholder_ids: [shareholder.id],
        address: shareholder.contact_info || 'Not specified',
        document_urls: [],
        verification_status: 'pending'
      });
    }
  }

  // Sync dividend declarations
  static syncDividendDeclaration(declaration: any) {
    // Create accounting entries for dividend declaration
    UniversalTransactionService.createTransaction({
      type: 'expense',
      amount: declaration.dividend_pool,
      description: `Dividend declaration - ${declaration.period}`,
      date: declaration.declaration_date,
      payment_method: 'bank',
      tax_category: 'dividend_expense',
      status: 'confirmed',
      company_id: this.getCurrentCompanyId()
    });

    // Create individual shareholder dividend transactions
    const distributions = DividendService.getDividendDistributions(declaration.id);
    distributions.forEach(distribution => {
      if (distribution.is_paid) {
        UniversalTransactionService.createTransaction({
          type: 'payment',
          amount: distribution.amount,
          description: `Dividend payment to ${distribution.shareholder_name}`,
          date: distribution.paid_on || declaration.declaration_date,
          payment_method: 'bank',
          status: 'confirmed',
          company_id: this.getCurrentCompanyId()
        });
      }
    });

    AuditLogService.logAction({
      action_type: 'create',
      table_name: 'dividend_declarations',
      record_id: declaration.id,
      description: `Dividend declaration processed and synced to accounting`,
      new_data: declaration
    });
  }

  // Assets integration
  static getAssetsData() {
    const stored = localStorage.getItem('fixed-assets');
    return stored ? JSON.parse(stored) : [];
  }

  static syncAssetToAccounting(asset: any) {
    // When asset is added, create accounting entries
    if (asset.purchaseAmount > 0) {
      // Create asset acquisition transaction
      UniversalTransactionService.createTransaction({
        type: 'asset_acquisition',
        amount: asset.purchaseAmount,
        description: `Asset Purchase - ${asset.name}`,
        date: asset.purchaseDate,
        payment_method: asset.paymentMethod || 'bank',
        status: 'confirmed',
        company_id: this.getCurrentCompanyId(),
        asset_details: {
          name: asset.name,
          category: asset.category,
          location: asset.location,
          useful_life_years: asset.usefulLife,
          residual_value: asset.residualValue || 0,
          depreciation_method: asset.depreciationMethod || 'straight_line'
        }
      });

      // Post to general ledger
      TransactionEngine.postTransaction({
        date: asset.purchaseDate,
        reference: `ASSET-${asset.id}`,
        description: `Asset Purchase - ${asset.name}`,
        source_id: asset.id,
        source_type: 'asset',
        entries: [
          { account_code: '1301', account_name: 'Fixed Assets', debit: asset.purchaseAmount },
          { account_code: '1001', account_name: 'Cash at Bank', credit: asset.purchaseAmount }
        ]
      });
    }
  }

  // Invoice integration
  static getInvoicesData() {
    const stored = localStorage.getItem('invoices');
    return stored ? JSON.parse(stored) : [];
  }

  static syncInvoiceToAccounting(invoice: any) {
    // Sync invoice with accounting system
    AccountingService.recordSalesInvoice({
      id: invoice.id,
      number: invoice.invoiceNumber,
      client: invoice.clientName,
      amount: invoice.totalAmount,
      date: invoice.issueDate,
      vatRate: 0.18
    });

    // Create universal transaction
    UniversalTransactionService.createTransaction({
      type: 'sale',
      amount: invoice.totalAmount,
      vat: invoice.vatAmount,
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
      date: invoice.issueDate,
      payment_method: 'bank',
      client: invoice.clientName,
      invoice_number: invoice.invoiceNumber,
      tin: invoice.clientTIN,
      status: invoice.status === 'paid' ? 'confirmed' : 'draft',
      company_id: this.getCurrentCompanyId()
    });
  }

  // Contracts integration
  static getContractsData() {
    const stored = localStorage.getItem('contracts');
    return stored ? JSON.parse(stored) : [];
  }

  static syncContractToCompliance(contract: any) {
    // Create compliance alerts for contract renewals
    const renewalDate = new Date(contract.endDate);
    renewalDate.setMonth(renewalDate.getMonth() - 1); // Alert 1 month before

    const alert = {
      id: `contract-renewal-${contract.id}`,
      title: `Contract Renewal Due: ${contract.title}`,
      description: `Contract with ${contract.otherParty} expires on ${contract.endDate}`,
      priority: 'medium',
      dueDate: renewalDate.toISOString().split('T')[0],
      category: 'contract_management',
      status: 'active',
      source: 'contracts'
    };

    // Store compliance alert
    const alerts = JSON.parse(localStorage.getItem('compliance-alerts') || '[]');
    const existingIndex = alerts.findIndex((a: any) => a.id === alert.id);
    
    if (existingIndex >= 0) {
      alerts[existingIndex] = alert;
    } else {
      alerts.push(alert);
    }
    
    localStorage.setItem('compliance-alerts', JSON.stringify(alerts));
    this.notify('compliance', alerts);
  }

  // Meeting minutes integration
  static syncMeetingToCompliance(meeting: any) {
    // Extract action items and create compliance tasks
    if (meeting.actionItems && meeting.actionItems.length > 0) {
      meeting.actionItems.forEach((action: any, index: number) => {
        const alert = {
          id: `meeting-action-${meeting.id}-${index}`,
          title: `Action Item: ${action.description}`,
          description: `From meeting: ${meeting.title} on ${meeting.date}`,
          priority: action.priority || 'medium',
          dueDate: action.dueDate,
          category: 'governance',
          status: 'active',
          source: 'meetings',
          assignee: action.assignee
        };

        const alerts = JSON.parse(localStorage.getItem('compliance-alerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('compliance-alerts', JSON.stringify(alerts));
      });
    }
  }

  // Payroll integration
  static syncPayrollToAccounting(payrollEntry: any) {
    // Record payroll in accounting system
    AccountingService.recordPayroll({
      id: payrollEntry.id,
      period: payrollEntry.period,
      employees: payrollEntry.employees,
      date: payrollEntry.payDate
    });

    // Create individual transactions for each employee
    payrollEntry.employees.forEach((employee: any) => {
      UniversalTransactionService.createTransaction({
        type: 'salary',
        amount: employee.netSalary,
        description: `Salary payment - ${employee.name} (${payrollEntry.period})`,
        date: payrollEntry.payDate,
        payment_method: 'bank',
        employee_id: employee.id,
        employee_name: employee.name,
        gross_salary: employee.grossSalary,
        paye_deduction: employee.payeTax,
        rssb_employee: employee.rssbEmployee,
        rssb_employer: employee.rssbEmployer,
        net_salary: employee.netSalary,
        status: 'confirmed',
        company_id: this.getCurrentCompanyId()
      });
    });
  }

  // Tax compliance integration
  static updateTaxObligations() {
    const transactions = UniversalTransactionService.getAllTransactions();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Calculate VAT due
    const vatSales = transactions
      .filter(t => t.type === 'sale' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + (t.vat || 0), 0);

    const vatPurchases = transactions
      .filter(t => t.type === 'purchase' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + (t.vat || 0), 0);

    // Calculate PAYE due from payroll
    const payeTax = transactions
      .filter(t => t.type === 'salary' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + (t.paye_deduction || 0), 0);

    // Update tax obligations
    const taxObligations = {
      vat_due: vatSales - vatPurchases,
      paye_due: payeTax,
      period: currentMonth,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('tax-obligations', JSON.stringify(taxObligations));
    this.notify('tax', taxObligations);
  }

  // Generate comprehensive ownership report
  static generateOwnershipReport() {
    const companyCapital = CompanyCapitalService.getCompanyCapital();
    const shareholders = CompanyCapitalService.getAllShareholders();
    const beneficialOwners = BeneficialOwnerService.getAllBeneficialOwners();
    const ownershipMappings = BeneficialOwnerService.getOwnershipMappings();
    const validation = BeneficialOwnerService.validateOwnershipPercentages();
    const capitalSummary = CompanyCapitalService.getCapitalSummary();

    return {
      company_capital: companyCapital,
      capital_summary: capitalSummary,
      shareholders: shareholders.map(s => ({
        ...s,
        ownership_percentage: companyCapital ? (s.shares_held / companyCapital.authorized_shares) * 100 : 0
      })),
      beneficial_owners: beneficialOwners,
      ownership_mappings: ownershipMappings,
      validation_results: validation,
      compliance_status: {
        total_shareholding_valid: validation.isValid,
        beneficial_owners_identified: beneficialOwners.length > 0,
        significant_controllers: beneficialOwners.filter(bo => bo.has_significant_control).length,
        ownership_transparency: beneficialOwners.filter(bo => bo.verification_status === 'verified').length / Math.max(1, beneficialOwners.length) * 100
      },
      generated_at: new Date().toISOString()
    };
  }

  // Generate comprehensive reports
  static async generateFinancialReport(startDate: string, endDate: string) {
    const integratedData = this.getIntegratedData();
    const trialBalance = await AccountingService.getTrialBalance(endDate);
    const financialSummary = await AccountingService.getFinancialSummary();
    const ownershipReport = this.generateOwnershipReport();
    
    return {
      period: { startDate, endDate },
      summary: financialSummary,
      trialBalance,
      transactions: integratedData.transactions.filter(
        t => t.date >= startDate && t.date <= endDate
      ),
      ownership_structure: ownershipReport,
      capital_structure: {
        authorized_capital: integratedData.companyCapital?.total_authorized_capital || 0,
        issued_capital: integratedData.companyCapital?.issued_shares * (integratedData.companyCapital?.share_price || 0) || 0,
        paid_up_capital: integratedData.companyCapital?.paid_up_capital || 0
      },
      shareholders_count: integratedData.shareholders.length,
      beneficial_owners_count: integratedData.beneficialOwners.length,
      dividend_payments: integratedData.dividends.filter(
        d => d.declaration_date >= startDate && d.declaration_date <= endDate
      ),
      compliance_status: this.getComplianceStatus(),
      audit_trail: AuditLogService.getAuditLogs({
        from_date: startDate,
        to_date: endDate
      })
    };
  }

  static getComplianceStatus() {
    const alerts = JSON.parse(localStorage.getItem('compliance-alerts') || '[]');
    const overdueAlerts = alerts.filter((alert: any) => 
      new Date(alert.dueDate) < new Date() && alert.status === 'active'
    );

    return {
      total_alerts: alerts.length,
      overdue_alerts: overdueAlerts.length,
      status: overdueAlerts.length === 0 ? 'compliant' : 'needs_attention'
    };
  }

  // Real-time data sync
  static syncAllData() {
    console.log('Starting comprehensive data sync...');
    
    // Sync directors with capital and beneficial ownership
    const directors = this.getDirectorsData();
    directors.forEach((director: any) => {
      if (director.shares && parseFloat(director.shares) > 0) {
        this.syncDirectorToCapital(director);
      }
    });

    // Sync shareholders with beneficial ownership
    const shareholders = CompanyCapitalService.getAllShareholders();
    const companyCapital = CompanyCapitalService.getCompanyCapital();
    
    if (companyCapital) {
      shareholders.forEach(shareholder => {
        const ownershipPercent = (shareholder.shares_held / companyCapital.authorized_shares) * 100;
        if (ownershipPercent >= 25) {
          this.syncShareholderToBeneficialOwner(shareholder, ownershipPercent);
        }
      });
    }

    // Sync employees with payroll
    const employees = this.getEmployeesData();
    employees.forEach((employee: any) => {
      this.syncEmployeeToPayroll(employee);
    });

    // Update tax obligations
    this.updateTaxObligations();

    // Validate ownership integrity
    const validation = BeneficialOwnerService.validateOwnershipPercentages();
    if (!validation.isValid) {
      console.warn('Ownership validation issues detected:', validation.violations);
    }

    console.log('Comprehensive data sync completed successfully');
    this.notify('sync-complete', { 
      timestamp: new Date().toISOString(),
      validation_results: validation
    });
  }
}

export default DataIntegrationService;
