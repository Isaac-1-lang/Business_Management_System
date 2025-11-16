
import { ArrowLeft, Plus, Calculator, Upload, Download, Eye, Filter, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AccountingEntryForm } from "@/components/forms/AccountingEntryForm";
import { UniversalTransactionForm } from "@/components/forms/UniversalTransactionForm";
import IncomeBreakdown from "@/components/reports/IncomeBreakdown";
import TransactionEngine from "@/services/transactionEngine";
import AccountingService from "@/services/accountingService";

export default function AccountingBooks() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showUniversalForm, setShowUniversalForm] = useState(false);
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Get real data from transaction engine
  const [generalLedger, setGeneralLedger] = useState<any[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>({
    revenue: 0,
    expenses: 0,
    profit: 0,
    assets: 0,
    liabilities: 0,
    equity: 0
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [ledger, summary] = await Promise.all([
        TransactionEngine.getGeneralLedger(),
        AccountingService.getFinancialSummary()
      ]);
      setGeneralLedger(Array.isArray(ledger) ? ledger : []);
      setFinancialSummary(summary || {
        revenue: 0,
        expenses: 0,
        profit: 0,
        assets: 0,
        liabilities: 0,
        equity: 0
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setGeneralLedger([]);
      setFinancialSummary({
        revenue: 0,
        expenses: 0,
        profit: 0,
        assets: 0,
        liabilities: 0,
        equity: 0
      });
    }
  };

  // Apply filters
  const filteredEntries = generalLedger.filter(entry => {
    const matchesType = filterType === "all" || entry.source_type === filterType;
    const matchesSearch = searchTerm === "" || 
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
    const matchesDateTo = !dateTo || entry.date <= dateTo;
    
    return matchesType && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Data Refreshed",
      description: "Accounting data has been updated successfully.",
    });
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const headers = ['Date', 'Reference', 'Account Code', 'Account Name', 'Description', 'Source Type', 'Debit', 'Credit'];
    const csvData = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.date,
        `"${entry.reference}"`,
        entry.account_code,
        `"${entry.account_name}"`,
        `"${entry.description}"`,
        entry.source_type,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-books-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Accounting books exported as ${format.toUpperCase()} file.`,
    });
  };

  const handleSuccess = () => {
    setShowUniversalForm(false);
    handleRefresh();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSourceTypeBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case "invoice": return "bg-green-100 text-green-800";
      case "purchase": return "bg-blue-100 text-blue-800";
      case "payroll": return "bg-purple-100 text-purple-800";
      case "asset": return "bg-yellow-100 text-yellow-800";
      case "payment": return "bg-orange-100 text-orange-800";
      case "manual": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const netBalance = totalDebits - totalCredits;

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
            <h1 className="text-2xl font-semibold">Accounting Books</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
            <Button onClick={() => setShowUniversalForm(true)} className="bg-green-600 hover:bg-green-700">
              <Zap className="w-4 h-4 mr-2" />
              Quick Transaction
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Universal Transaction System</h3>
                  <p className="text-sm text-gray-600">
                    Use Quick Transaction for single-entry bookkeeping. Automatically updates Journal, Ledger, Cash Book, and generates proper double entries.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowIncomeBreakdown(true)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Income Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalDebits)}
              </div>
              <div className="text-sm text-gray-600">Total Debits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalCredits)}
              </div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(netBalance))}
              </div>
              <div className="text-sm text-gray-600">Net Balance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredEntries.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Main Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Accounting Entries
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                  placeholder="From Date"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                  placeholder="To Date"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Sales</SelectItem>
                    <SelectItem value="purchase">Purchases</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="asset">Assets</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Search entries..." 
                  className="w-60" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Debit (RWF)</TableHead>
                    <TableHead className="text-right">Credit (RWF)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-gray-50">
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.account_code}</div>
                            <div className="text-sm text-gray-600">{entry.account_name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>
                          <Badge className={getSourceTypeBadgeColor(entry.source_type)}>
                            {entry.source_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchTerm || filterType !== "all" || dateFrom || dateTo 
                          ? "No entries found matching your criteria"
                          : "No accounting entries found. Use Quick Transaction to add your first entry."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Summary Footer */}
            {filteredEntries.length > 0 && (
              <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(totalDebits)}
                    </div>
                    <div className="text-sm text-gray-600">Total Debits</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(totalCredits)}
                    </div>
                    <div className="text-sm text-gray-600">Total Credits</div>
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
                      {Math.abs(totalDebits - totalCredits) < 0.01 ? 'Balanced' : formatCurrency(Math.abs(totalDebits - totalCredits))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.abs(totalDebits - totalCredits) < 0.01 ? 'Books are balanced' : 'Difference'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forms and Modals */}
        <AccountingEntryForm open={showForm} onClose={() => setShowForm(false)} />
        <UniversalTransactionForm 
          open={showUniversalForm} 
          onClose={() => setShowUniversalForm(false)}
          onSuccess={handleSuccess}
        />
        
        {/* Income Breakdown Modal */}
        {showIncomeBreakdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Income Source Analysis</h2>
                <Button variant="ghost" onClick={() => setShowIncomeBreakdown(false)}>
                  ×
                </Button>
              </div>
              <div className="p-4">
                <IncomeBreakdown />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
