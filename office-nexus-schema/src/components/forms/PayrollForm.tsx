import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Download, Users } from "lucide-react";
import PayrollService, { PayrollRecord, PayrollSummary } from "@/services/payrollService";
import UniversalTransactionService from "@/services/universalTransactionService";

interface PayrollFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayrollForm({ open, onClose, onSuccess }: PayrollFormProps) {
  const { toast } = useToast();
  const [month, setMonth] = useState('');
  const [generatedPayroll, setGeneratedPayroll] = useState<PayrollRecord[] | null>(null);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleGeneratePayroll = async () => {
    if (!month) {
      toast({
        title: "Validation Error",
        description: "Please select a month",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const payrollRecords = PayrollService.generatePayroll(month);
      const summary = PayrollService.getPayrollSummary(month);
      
      setGeneratedPayroll(payrollRecords);
      setPayrollSummary(summary);
      
      toast({
        title: "Payroll Generated",
        description: `Payroll for ${month} has been generated successfully for ${payrollRecords.length} employees`
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate payroll",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostToAccounting = async () => {
    if (!generatedPayroll || !month) return;

    setIsPosting(true);
    try {
      // Post each payroll record as a Universal Transaction
      for (const record of generatedPayroll) {
        UniversalTransactionService.createTransaction({
          type: 'salary',
          amount: record.grossSalary + record.rssbEmployer, // Total cost to company
          payment_method: 'bank',
          description: `Salary Payment - ${record.employee.fullName} - ${month}`,
          date: new Date().toISOString().split('T')[0],
          reference_number: `PAY-${month}-${record.employee.id}`,
          employee_id: record.employee.id.toString(),
          employee_name: record.employee.fullName,
          gross_salary: record.grossSalary,
          paye_deduction: record.paye,
          rssb_employee: record.rssbEmployee,
          rssb_employer: record.rssbEmployer,
          net_salary: record.netSalary,
          status: 'confirmed',
          company_id: localStorage.getItem('selectedCompanyId') || 'comp-001'
        });
      }

      toast({
        title: "Posted to Accounting",
        description: `Payroll transactions have been posted to the accounting system. Check General Ledger for entries.`
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post to accounting",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDownloadPayroll = () => {
    if (!generatedPayroll || !month) return;
    
    const csvData = PayrollService.exportPayrollToCSV(month);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "Payroll has been exported to CSV"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedPayroll) {
      onSuccess();
      onClose();
      // Reset form
      setGeneratedPayroll(null);
      setPayrollSummary(null);
      setMonth('');
    }
  };

  const formatCurrency = (amount: number): string => {
    return PayrollService.formatCurrency(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Generate Monthly Payroll
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Payroll Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="button" 
                onClick={handleGeneratePayroll}
                disabled={isGenerating || !month}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Payroll"}
              </Button>
            </div>
          </div>

          {payrollSummary && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Payroll Summary for {payrollSummary.month}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Employees:</span>
                  <span className="ml-2 font-medium">{payrollSummary.totalEmployees}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gross Pay:</span>
                  <span className="ml-2 font-medium">{formatCurrency(payrollSummary.totalGrossPay)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total PAYE:</span>
                  <span className="ml-2 font-medium">{formatCurrency(payrollSummary.totalPaye)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total RSSB:</span>
                  <span className="ml-2 font-medium">{formatCurrency(payrollSummary.totalRssbEmployee + payrollSummary.totalRssbEmployer)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Net Pay:</span>
                  <span className="ml-2 font-bold text-lg text-green-600">{formatCurrency(payrollSummary.totalNetPay)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Paid:</span>
                  <span className="ml-2 font-medium">{payrollSummary.paidCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Unpaid:</span>
                  <span className="ml-2 font-medium text-red-600">{payrollSummary.unpaidCount}</span>
                </div>
              </div>
            </div>
          )}

          {generatedPayroll && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Payroll Details</h4>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleDownloadPayroll}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handlePostToAccounting}
                    disabled={isPosting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isPosting ? "Posting..." : "Post to Accounting"}
                  </Button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 border-b">Employee</th>
                      <th className="text-left p-3 border-b">Position</th>
                      <th className="text-right p-3 border-b">Gross Salary</th>
                      <th className="text-right p-3 border-b">PAYE</th>
                      <th className="text-right p-3 border-b">RSSB</th>
                      <th className="text-right p-3 border-b">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedPayroll.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{record.employee.fullName}</div>
                            <div className="text-gray-500">{record.employee.email}</div>
                          </div>
                        </td>
                        <td className="p-3">{record.employee.position}</td>
                        <td className="p-3 text-right">{formatCurrency(record.grossSalary)}</td>
                        <td className="p-3 text-right">{formatCurrency(record.paye)}</td>
                        <td className="p-3 text-right">{formatCurrency(record.rssbEmployee)}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(record.netSalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Accounting Integration</h5>
                <p className="text-sm text-green-700">
                  Once posted to accounting, this payroll will automatically create:
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Journal entries for salary expenses and liabilities</li>
                  <li>• General ledger postings for all accounts</li>
                  <li>• Cash book entries for bank payments</li>
                  <li>• PAYE and RSSB payable balances for tax filing</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!generatedPayroll}
            >
              Save Payroll
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
