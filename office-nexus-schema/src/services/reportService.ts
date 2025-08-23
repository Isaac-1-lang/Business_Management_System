import { jsPDF } from 'jspdf';
import AccountingService from './accountingService';
import DataIntegrationService from './dataIntegrationService';
import CompanyCapitalService from './companyCapitalService';
import BeneficialOwnerService from './beneficialOwnerService';
import DividendService from './dividendService';
import AuditLogService from './auditLogService';

export interface ReportData {
  title: string;
  data: any;
  generatedAt: string;
  period?: string;
}

class ReportService {
  static async generateFinancialSummary(): Promise<ReportData> {
    const summary = AccountingService.getFinancialSummary();
    const currentDate = new Date().toISOString().split('T')[0];
    
    return {
      title: 'Monthly Financial Summary',
      data: {
        revenue: summary.revenue,
        expenses: summary.expenses,
        profit: summary.profit,
        assets: summary.assets,
        liabilities: summary.liabilities,
        equity: summary.equity
      },
      generatedAt: new Date().toISOString(),
      period: `As of ${currentDate}`
    };
  }

  static async generatePayrollReport(): Promise<ReportData> {
    // Mock payroll data - in real app this would come from payroll service
    const payrollData = {
      totalEmployees: 25,
      totalGrossSalary: 18500000,
      totalPayeTax: 2220000,
      totalRssbContributions: 1295000,
      totalNetPay: 14985000,
      period: new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long' })
    };

    return {
      title: 'Payroll Report',
      data: payrollData,
      generatedAt: new Date().toISOString(),
      period: payrollData.period
    };
  }

  static async generateVATReport(): Promise<ReportData> {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const vatReport = AccountingService.getVATReport(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );

    return {
      title: 'Tax Filing Bundle',
      data: vatReport,
      generatedAt: new Date().toISOString(),
      period: vatReport.period
    };
  }

  static async generateComplianceStatus(): Promise<ReportData> {
    // Mock compliance data
    const complianceData = {
      totalRegisters: 8,
      upToDateRegisters: 7,
      pendingUpdates: 1,
      licensesExpiring: 2,
      upcomingDeadlines: 3,
      complianceScore: 87.5
    };

    return {
      title: 'Compliance Status',
      data: complianceData,
      generatedAt: new Date().toISOString()
    };
  }

  static async generateAuditTrail(): Promise<ReportData> {
    const auditData = {
      totalTransactions: 156,
      lastAuditDate: '2024-06-15',
      flaggedTransactions: 3,
      systemChanges: 12,
      userActivities: 89
    };

    return {
      title: 'Audit Trail',
      data: auditData,
      generatedAt: new Date().toISOString()
    };
  }

  static async generatePerformanceDashboard(): Promise<ReportData> {
    const performanceData = {
      monthlyGrowth: 12.3,
      customerSatisfaction: 94.2,
      operationalEfficiency: 88.7,
      profitMargin: 28.9,
      employeeProductivity: 91.5
    };

    return {
      title: 'Performance Dashboard',
      data: performanceData,
      generatedAt: new Date().toISOString()
    };
  }

  static async generateOwnershipReport(): Promise<ReportData> {
    const ownershipData = DataIntegrationService.generateOwnershipReport();
    
    return {
      title: 'Ownership & Control Report',
      data: ownershipData,
      generatedAt: new Date().toISOString(),
      period: `As of ${new Date().toLocaleDateString()}`
    };
  }

  static async generateCapitalReport(): Promise<ReportData> {
    const companyCapital = CompanyCapitalService.getCompanyCapital();
    const capitalSummary = CompanyCapitalService.getCapitalSummary();
    const shareholders = CompanyCapitalService.getAllShareholders();
    const contributions = CompanyCapitalService.getCapitalContributions();

    const capitalData = {
      company_capital: companyCapital,
      summary: capitalSummary,
      shareholders: shareholders.length,
      active_shareholders: shareholders.filter(s => s.is_active).length,
      total_contributions: contributions.length,
      confirmed_contributions: contributions.filter(c => c.status === 'confirmed').length,
      pending_contributions: contributions.filter(c => c.status === 'pending').length,
      utilization_rate: capitalSummary.utilization_percentage
    };

    return {
      title: 'Capital Structure Report',
      data: capitalData,
      generatedAt: new Date().toISOString(),
      period: `As of ${new Date().toLocaleDateString()}`
    };
  }

  static async generateBeneficialOwnershipReport(): Promise<ReportData> {
    const beneficialOwners = BeneficialOwnerService.getAllBeneficialOwners();
    const validation = BeneficialOwnerService.validateOwnershipPercentages();
    const ownershipMappings = BeneficialOwnerService.getOwnershipMappings();

    const boData = {
      total_beneficial_owners: beneficialOwners.length,
      verified_owners: beneficialOwners.filter(bo => bo.verification_status === 'verified').length,
      significant_controllers: beneficialOwners.filter(bo => bo.has_significant_control).length,
      ownership_validation: validation,
      ownership_mappings: ownershipMappings.length,
      compliance_score: validation.isValid ? 100 : 75,
      nationalities: [...new Set(beneficialOwners.map(bo => bo.nationality))],
      control_types: beneficialOwners.flatMap(bo => bo.control_nature).reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return {
      title: 'Beneficial Ownership Register',
      data: boData,
      generatedAt: new Date().toISOString(),
      period: `As of ${new Date().toLocaleDateString()}`
    };
  }

  static async generateDividendReport(): Promise<ReportData> {
    const declarations = DividendService.getAllDeclarations();
    const currentYear = new Date().getFullYear();
    const currentYearDeclarations = declarations.filter(d => 
      new Date(d.declaration_date).getFullYear() === currentYear
    );

    const dividendData = {
      total_declarations: declarations.length,
      current_year_declarations: currentYearDeclarations.length,
      total_dividend_pool: declarations.reduce((sum, d) => sum + d.dividend_pool, 0),
      current_year_pool: currentYearDeclarations.reduce((sum, d) => sum + d.dividend_pool, 0),
      paid_declarations: declarations.filter(d => d.status === 'paid').length,
      pending_declarations: declarations.filter(d => d.status === 'confirmed').length,
      average_dividend_per_declaration: declarations.length > 0 ? 
        declarations.reduce((sum, d) => sum + d.dividend_pool, 0) / declarations.length : 0
    };

    return {
      title: 'Dividend Distribution Report',
      data: dividendData,
      generatedAt: new Date().toISOString(),
      period: `Year ${currentYear}`
    };
  }

  static async generateComprehensiveComplianceReport(): Promise<ReportData> {
    const ownershipReport = await this.generateOwnershipReport();
    const capitalReport = await this.generateCapitalReport();
    const boReport = await this.generateBeneficialOwnershipReport();
    const auditSummary = AuditLogService.getActivitySummary(30);

    const complianceData = {
      ownership_compliance: {
        status: ownershipReport.data.validation_results.isValid ? 'Compliant' : 'Non-Compliant',
        issues: ownershipReport.data.validation_results.violations
      },
      capital_compliance: {
        status: capitalReport.data.summary.utilization_percentage <= 100 ? 'Compliant' : 'Over-Allocated',
        utilization: capitalReport.data.summary.utilization_percentage
      },
      beneficial_ownership_compliance: {
        status: boReport.data.compliance_score >= 90 ? 'Compliant' : 'Needs Attention',
        score: boReport.data.compliance_score,
        verified_percentage: (boReport.data.verified_owners / boReport.data.total_beneficial_owners) * 100
      },
      audit_activity: auditSummary,
      overall_status: 'Under Review',
      recommendations: [
        'Complete beneficial owner verification for all entries',
        'Ensure share allocation does not exceed authorized capital',
        'Maintain regular dividend distribution records',
        'Update shareholder information annually'
      ]
    };

    return {
      title: 'Comprehensive Compliance Report',
      data: complianceData,
      generatedAt: new Date().toISOString(),
      period: `Assessment as of ${new Date().toLocaleDateString()}`
    };
  }

  static async generatePDF(reportData: ReportData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text(reportData.title, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    
    if (reportData.period) {
      doc.text(`Period: ${reportData.period}`, pageWidth / 2, 40, { align: 'center' });
    }

    // Content based on report type
    let yPosition = reportData.period ? 60 : 50;
    doc.setFontSize(12);

    // Handle different report types with better formatting
    if (reportData.title.includes('Ownership')) {
      this.formatOwnershipPDF(doc, reportData.data, yPosition);
    } else if (reportData.title.includes('Capital')) {
      this.formatCapitalPDF(doc, reportData.data, yPosition);
    } else if (reportData.title.includes('Beneficial')) {
      this.formatBeneficialOwnershipPDF(doc, reportData.data, yPosition);
    } else {
      // Default formatting
      Object.entries(reportData.data).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let displayValue = value;
        
        if (typeof value === 'number' && value > 1000) {
          displayValue = this.formatCurrency(value);
        } else if (typeof value === 'number' && value < 100) {
          displayValue = `${value}%`;
        }
        
        doc.text(`${label}: ${displayValue}`, 20, yPosition);
        yPosition += 10;
      });
    }

    // Download the PDF
    doc.save(`${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private static formatOwnershipPDF(doc: jsPDF, data: any, startY: number) {
    let yPosition = startY;
    
    doc.text('Company Capital Structure:', 20, yPosition);
    yPosition += 10;
    
    if (data.company_capital) {
      doc.text(`Authorized Shares: ${data.company_capital.authorized_shares.toLocaleString()}`, 30, yPosition);
      yPosition += 8;
      doc.text(`Share Price: ${this.formatCurrency(data.company_capital.share_price)}`, 30, yPosition);
      yPosition += 8;
      doc.text(`Total Authorized Capital: ${this.formatCurrency(data.company_capital.total_authorized_capital)}`, 30, yPosition);
      yPosition += 15;
    }

    doc.text(`Total Shareholders: ${data.shareholders.length}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Beneficial Owners: ${data.beneficial_owners.length}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Significant Controllers: ${data.compliance_status.significant_controllers}`, 20, yPosition);
  }

  private static formatCapitalPDF(doc: jsPDF, data: any, startY: number) {
    let yPosition = startY;
    
    doc.text('Capital Summary:', 20, yPosition);
    yPosition += 10;
    
    doc.text(`Authorized Capital: ${this.formatCurrency(data.summary.authorized_capital)}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Issued Capital: ${this.formatCurrency(data.summary.issued_capital)}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Paid-up Capital: ${this.formatCurrency(data.summary.paid_up_capital)}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Utilization Rate: ${data.summary.utilization_percentage.toFixed(1)}%`, 30, yPosition);
    yPosition += 15;
    
    doc.text(`Active Shareholders: ${data.active_shareholders}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Contributions: ${data.total_contributions}`, 20, yPosition);
  }

  private static formatBeneficialOwnershipPDF(doc: jsPDF, data: any, startY: number) {
    let yPosition = startY;
    
    doc.text('Beneficial Ownership Summary:', 20, yPosition);
    yPosition += 10;
    
    doc.text(`Total Beneficial Owners: ${data.total_beneficial_owners}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Verified Owners: ${data.verified_owners}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Significant Controllers: ${data.significant_controllers}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Compliance Score: ${data.compliance_score}%`, 30, yPosition);
    yPosition += 15;
    
    if (data.ownership_validation && !data.ownership_validation.isValid) {
      doc.text('Validation Issues:', 20, yPosition);
      yPosition += 10;
      data.ownership_validation.violations.forEach((issue: string) => {
        doc.text(`• ${issue}`, 30, yPosition);
        yPosition += 8;
      });
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export default ReportService;
