
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Download, Filter, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import TransactionEngine from "@/services/transactionEngine";
import AccountingService from "@/services/accountingService";

export default function GeneralLedger() {
  const { toast } = useToast();
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterSourceType, setFilterSourceType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [generalLedger, setGeneralLedger] = useState<any[]>([]);
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
  }, []);
  
  const loadData = async () => {
    try {
      const [ledger, balance, summary] = await Promise.all([
        TransactionEngine.getGeneralLedger(),
        TransactionEngine.getTrialBalance(),
        AccountingService.getFinancialSummary()
      ]);
      setGeneralLedger(Array.isArray(ledger) ? ledger : []);
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
      console.error('Error loading data:', error);
      setGeneralLedger([]);
      setTrialBalance([]);
    }
  };
  
  // Filter entries
  const filteredEntries = generalLedger.filter(entry => {
    if (!entry) return false;
    
    const matchesAccount = filterAccount === "all" || entry.account_code === filterAccount;
    const matchesSourceType = filterSourceType === "all" || entry.source_type === filterSourceType;
    const matchesSearch = searchTerm === "" || (
      (entry.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.account_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesAccount && matchesSourceType && matchesSearch;
  });
  
  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Downloading general ledger in ${format} format...`,
    });
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">General Ledger</h1>
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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialSummary.revenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(financialSummary.expenses)}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(financialSummary.profit)}
              </div>
              <div className="text-sm text-gray-600">Net Profit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {generalLedger.length}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </CardContent>
          </Card>
        </div>

        {/* General Ledger Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                General Ledger Entries
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterAccount} onValueChange={setFilterAccount}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    <SelectItem value="1001">Cash at Bank</SelectItem>
                    <SelectItem value="1101">Accounts Receivable</SelectItem>
                    <SelectItem value="2001">Accounts Payable</SelectItem>
                    <SelectItem value="2101">VAT Payable</SelectItem>
                    <SelectItem value="4001">Sales Revenue</SelectItem>
                    <SelectItem value="5001">Salaries & Wages</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSourceType} onValueChange={setFilterSourceType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Search entries..." 
                  className="max-w-xs" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit (RWF)</TableHead>
                  <TableHead className="text-right">Credit (RWF)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-mono">{entry.reference}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.account_code}</div>
                        <div className="text-sm text-gray-600">{entry.account_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSourceTypeBadgeColor(entry.source_type)}>
                        {entry.source_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No entries found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
