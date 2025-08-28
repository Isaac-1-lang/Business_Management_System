
export interface Employee {
  id: number;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  grossSalary: number;
  rssbNumber: string;
  status: 'active' | 'inactive';
  contractDocument?: string;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employee: Employee;
  month: string;
  grossSalary: number;
  paye: number;
  rssbEmployee: number;
  rssbEmployer: number;
  netSalary: number;
  paid: boolean;
  generatedDate: string;
}

export interface PayrollSummary {
  month: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalPaye: number;
  totalRssbEmployee: number;
  totalRssbEmployer: number;
  totalNetPay: number;
  paidCount: number;
  unpaidCount: number;
}

class PayrollService {
  // Empty array - replace with actual API calls in production
  private static employees: Employee[] = [];
  private static payrollRecords: PayrollRecord[] = [];

  // Get all active employees
  static getActiveEmployees(): Employee[] {
    return this.employees.filter(emp => emp.status === 'active');
  }

  // Get all employees
  static getAllEmployees(): Employee[] {
    return this.employees;
  }

  // Add new employee
  static addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const newEmployee = {
      ...employee,
      id: Math.max(...this.employees.map(e => e.id), 0) + 1
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  // Update employee
  static updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;
    
    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  // Calculate PAYE based on Rwanda tax bands (simplified)
  static calculatePaye(grossSalary: number): number {
    // Simplified PAYE calculation - 15% flat rate for demo
    // In real system, use progressive tax bands
    const taxableAmount = Math.max(0, grossSalary - 30000); // Basic exemption
    return Math.round(taxableAmount * 0.15);
  }

  // Calculate RSSB contributions
  static calculateRssb(grossSalary: number): { employee: number; employer: number } {
    const employee = Math.round(grossSalary * 0.075); // 7.5%
    const employer = Math.round(grossSalary * 0.075); // 7.5%
    return { employee, employer };
  }

  // Generate payroll for a specific month
  static generatePayroll(month: string): PayrollRecord[] {
    // Check if payroll already exists for this month
    const existingPayroll = this.payrollRecords.filter(record => record.month === month);
    if (existingPayroll.length > 0) {
      throw new Error(`Payroll for ${month} already exists`);
    }

    const activeEmployees = this.getActiveEmployees();
    const newPayrollRecords: PayrollRecord[] = [];

    activeEmployees.forEach(employee => {
      const paye = this.calculatePaye(employee.grossSalary);
      const rssb = this.calculateRssb(employee.grossSalary);
      const netSalary = employee.grossSalary - paye - rssb.employee;

      const payrollRecord: PayrollRecord = {
        id: this.payrollRecords.length + newPayrollRecords.length + 1,
        employeeId: employee.id,
        employee,
        month,
        grossSalary: employee.grossSalary,
        paye,
        rssbEmployee: rssb.employee,
        rssbEmployer: rssb.employer,
        netSalary,
        paid: false,
        generatedDate: new Date().toISOString()
      };

      newPayrollRecords.push(payrollRecord);
    });

    // Add to records
    this.payrollRecords.push(...newPayrollRecords);
    return newPayrollRecords;
  }

  // Get payroll records for a specific month
  static getPayrollByMonth(month: string): PayrollRecord[] {
    return this.payrollRecords.filter(record => record.month === month);
  }

  // Get all payroll records
  static getAllPayrollRecords(): PayrollRecord[] {
    return this.payrollRecords;
  }

  // Mark payroll as paid
  static markAsPaid(payrollId: number): boolean {
    const record = this.payrollRecords.find(r => r.id === payrollId);
    if (record) {
      record.paid = true;
      return true;
    }
    return false;
  }

  // Get payroll summary for a month
  static getPayrollSummary(month: string): PayrollSummary | null {
    const records = this.getPayrollByMonth(month);
    if (records.length === 0) return null;

    return {
      month,
      totalEmployees: records.length,
      totalGrossPay: records.reduce((sum, r) => sum + r.grossSalary, 0),
      totalPaye: records.reduce((sum, r) => sum + r.paye, 0),
      totalRssbEmployee: records.reduce((sum, r) => sum + r.rssbEmployee, 0),
      totalRssbEmployer: records.reduce((sum, r) => sum + r.rssbEmployer, 0),
      totalNetPay: records.reduce((sum, r) => sum + r.netSalary, 0),
      paidCount: records.filter(r => r.paid).length,
      unpaidCount: records.filter(r => !r.paid).length
    };
  }

  // Generate payslip data for an employee
  static generatePayslip(payrollId: number): PayrollRecord | null {
    return this.payrollRecords.find(r => r.id === payrollId) || null;
  }

  // Get months with payroll data
  static getPayrollMonths(): string[] {
    const months = [...new Set(this.payrollRecords.map(r => r.month))];
    return months.sort().reverse();
  }

  // Format currency for display
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Export payroll to CSV format
  static exportPayrollToCSV(month: string): string {
    const records = this.getPayrollByMonth(month);
    if (records.length === 0) return '';

    const headers = [
      'Employee Name',
      'National ID',
      'Position',
      'Department',
      'Gross Salary',
      'PAYE',
      'RSSB Employee',
      'RSSB Employer',
      'Net Salary',
      'Paid Status'
    ];

    const rows = records.map(record => [
      record.employee.fullName,
      record.employee.nationalId,
      record.employee.position,
      record.employee.department,
      record.grossSalary.toString(),
      record.paye.toString(),
      record.rssbEmployee.toString(),
      record.rssbEmployer.toString(),
      record.netSalary.toString(),
      record.paid ? 'Paid' : 'Unpaid'
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  // Check for upcoming compliance deadlines
  static getComplianceAlerts(): Array<{
    type: 'paye' | 'rssb' | 'contract_expiry';
    message: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const alerts = [];
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // Check if payroll exists for current month
    const currentPayroll = this.getPayrollByMonth(currentMonth);
    const nextFilingDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);

    if (currentPayroll.length === 0) {
      alerts.push({
        type: 'paye' as const,
        message: `Payroll for ${currentMonth} not generated yet`,
        dueDate: nextFilingDate.toISOString().split('T')[0],
        priority: 'high' as const
      });
    }

    // Check unpaid payrolls
    const unpaidRecords = this.payrollRecords.filter(r => !r.paid);
    if (unpaidRecords.length > 0) {
      alerts.push({
        type: 'paye' as const,
        message: `${unpaidRecords.length} unpaid payroll records`,
        dueDate: nextFilingDate.toISOString().split('T')[0],
        priority: 'medium' as const
      });
    }

    return alerts;
  }
}

export default PayrollService;
