
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AccountingService from "@/services/accountingService";

export default function TrialBalance() {
  const { toast } = useToast();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    assets: 0,
    liabilities: 0,
    equity: 0
  });
  
  useEffect(() => {
    loadData();
  }, [asOfDate]);
  
  const loadData = async () => {
    try {
      const [balance, summary] = await Promise.all([
        AccountingService.getTrialBalance(asOfDate),
        AccountingService.getFinancialSummary()
      ]);
      setTrialBalance(Array.isArray(balance) ? balance : []);
      setFinancialSummary(summary || {
        revenue: 0,
        expenses: 0,
        profit: 0,
        assets: 0,
        liabilities: 0,
        equity: 0
      });
    } catch (error) {
      console.error('Error loading trial balance:', error);
      setTrialBalance([]);
    }
  };
  
  const totalDebits = trialBalance.reduce((sum, acc) => sum + (acc.debit || 0), 0);
  const totalCredits = trialBalance.reduce((sum, acc) => sum + (acc.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Downloading trial balance in ${format} format...`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAccountTypeColor = (accountCode: string | undefined) => {
    if (!accountCode || typeof accountCode !== 'string') return 'text-gray-700';
    if (accountCode.startsWith('1')) return 'text-blue-700'; // Assets
    if (accountCode.startsWith('2')) return 'text-red-700';  // Liabilities
    if (accountCode.startsWith('3')) return 'text-purple-700'; // Equity
    if (accountCode.startsWith('4')) return 'text-green-700'; // Revenue
    if (accountCode.startsWith('5')) return 'text-orange-700'; // Expenses
    return 'text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Trial Balance</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("Excel")}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport("PDF")}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label htmlFor="asOfDate" className="font-medium">As of Date:</label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-48"
              />
              <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isBalanced ? '✓ Balanced' : '⚠ Out of Balance'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(financialSummary.assets)}
              </div>
              <div className="text-sm text-gray-600">Total Assets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(financialSummary.liabilities)}
              </div>
              <div className="text-sm text-gray-600">Total Liabilities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(financialSummary.equity)}
              </div>
              <div className="text-sm text-gray-600">Total Equity</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialSummary.profit)}
              </div>
              <div className="text-sm text-gray-600">Net Profit</div>
            </CardContent>
          </Card>
        </div>

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Trial Balance as of {asOfDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right">Debit (RWF)</TableHead>
                  <TableHead className="text-right">Credit (RWF)</TableHead>
                  <TableHead className="text-right">Balance (RWF)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.map((account, index) => (
                  account && (account.debit > 0 || account.credit > 0) ? (
                    <TableRow key={account.account_code || `account-${index}`}>
                      <TableCell className={`font-mono font-medium ${getAccountTypeColor(account.account_code)}`}>
                        {account.account_code || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">{account.account_name || account.account || 'Unnamed Account'}</TableCell>
                      <TableCell className="text-right">
                        {account.debit > 0 ? formatCurrency(account.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {account.credit > 0 ? formatCurrency(account.credit) : "-"}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        account.balance > 0 ? 'text-blue-600' : account.balance < 0 ? 'text-red-600' : ''
                      }`}>
                        {account.balance !== 0 ? formatCurrency(Math.abs(account.balance)) : "-"}
                        {account.balance < 0 ? ' (CR)' : ''}
                      </TableCell>
                    </TableRow>
                  ) : null
                ))}
                
                {/* Totals Row */}
                <TableRow className="border-t-2 font-bold bg-gray-50">
                  <TableCell colSpan={2} className="text-right">TOTALS</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                  <TableCell className="text-right">
                    {isBalanced ? '✓ Balanced' : `Difference: ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {trialBalance.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No account balances found for the selected date
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
