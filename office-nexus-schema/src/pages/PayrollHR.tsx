import { ArrowLeft, Plus, UserCheck, Upload, Download, Eye, Filter, Calendar, Users, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { PayrollForm } from "@/components/forms/PayrollForm";
import PayrollService, { PayrollRecord, Employee } from "@/services/payrollService";
import { useToast } from "@/hooks/use-toast";

export default function PayrollHR() {
  const { toast } = useToast();
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadEmployees();
    loadPayrollData();
  }, [selectedMonth]);

  const loadEmployees = async () => {
    const allEmployees = await PayrollService.getAllEmployees();
    setEmployees(allEmployees);
  };

  const loadPayrollData = () => {
    const records = PayrollService.getPayrollByMonth(selectedMonth);
    setPayrollRecords(records);
  };

  const handleGeneratePayroll = () => {
    setShowPayrollForm(true);
  };

  const handlePayrollSuccess = () => {
    loadPayrollData();
    toast({
      title: "Success",
      description: "Payroll has been generated and saved successfully"
    });
  };

  const handleMarkAsPaid = (payrollId: number) => {
    const success = PayrollService.markAsPaid(payrollId);
    if (success) {
      loadPayrollData();
      toast({
        title: "Payment Marked",
        description: "Payroll record has been marked as paid"
      });
    }
  };

  const handleDownloadPayslip = (payrollId: number) => {
    const payslip = PayrollService.generatePayslip(payrollId);
    if (payslip) {
      // In a real system, this would generate a proper PDF
      const payslipData = {
        employee: payslip.employee.fullName,
        month: payslip.month,
        grossSalary: payslip.grossSalary,
        paye: payslip.paye,
        rssb: payslip.rssbEmployee,
        netSalary: payslip.netSalary
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payslipData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `payslip_${payslip.employee.fullName}_${payslip.month}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast({
        title: "Payslip Downloaded",
        description: "Payslip has been downloaded successfully"
      });
    }
  };

  const handleExportPayroll = () => {
    if (payrollRecords.length === 0) {
      toast({
        title: "No Data",
        description: "No payroll data to export for the selected month",
        variant: "destructive"
      });
      return;
    }

    const csvData = PayrollService.exportPayrollToCSV(selectedMonth);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Payroll data has been exported to CSV"
    });
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const payrollSummary = PayrollService.getPayrollSummary(selectedMonth);
  const alerts = PayrollService.getComplianceAlerts();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Payroll & HR</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEmployeeForm(true)}>
              <Users className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
            <Button variant="outline" onClick={handleExportPayroll}>
              <Upload className="w-4 h-4 mr-2" />
              Export Payroll
            </Button>
            <Button onClick={handleGeneratePayroll}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* Compliance Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <span className="font-medium">{alert.message}</span>
                        <span className="text-sm text-gray-600 ml-2">Due: {alert.dueDate}</span>
                      </div>
                      <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                        {alert.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{activeEmployees}</div>
              <div className="text-sm text-gray-600">Active Employees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {payrollSummary ? PayrollService.formatCurrency(payrollSummary.totalGrossPay) : 'RWF 0'}
              </div>
              <div className="text-sm text-gray-600">Monthly Gross Pay</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {payrollSummary ? PayrollService.formatCurrency(payrollSummary.totalPaye) : 'RWF 0'}
              </div>
              <div className="text-sm text-gray-600">Monthly PAYE</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {payrollSummary ? PayrollService.formatCurrency(payrollSummary.totalRssbEmployee + payrollSummary.totalRssbEmployer) : 'RWF 0'}
              </div>
              <div className="text-sm text-gray-600">Monthly RSSB</div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Data */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Payroll Records
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="max-w-xs"
                />
                <Input 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs" 
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payrollRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead className="text-right">PAYE</TableHead>
                    <TableHead className="text-right">RSSB</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{record.employee.fullName}</div>
                          <div className="text-sm text-gray-600">{record.employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.employee.position}</TableCell>
                      <TableCell className="text-right">{PayrollService.formatCurrency(record.grossSalary)}</TableCell>
                      <TableCell className="text-right">{PayrollService.formatCurrency(record.paye)}</TableCell>
                      <TableCell className="text-right">{PayrollService.formatCurrency(record.rssbEmployee)}</TableCell>
                      <TableCell className="text-right font-semibold">{PayrollService.formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>
                        <Badge className={record.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {record.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadPayslip(record.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          {!record.paid && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsPaid(record.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No payroll data for {selectedMonth}</div>
                <Button onClick={handleGeneratePayroll}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Generate Payroll for {selectedMonth}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employee Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{employee.fullName}</div>
                        <div className="text-sm text-gray-600">{employee.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.startDate}</TableCell>
                    <TableCell className="text-right">{PayrollService.formatCurrency(employee.grossSalary)}</TableCell>
                    <TableCell>
                      <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <EmployeeForm open={showEmployeeForm} onClose={() => setShowEmployeeForm(false)} />
        <PayrollForm 
          open={showPayrollForm} 
          onClose={() => setShowPayrollForm(false)}
          onSuccess={handlePayrollSuccess}
        />
      </div>
    </div>
  );
}
