
import { ArrowLeft, Plus, Receipt, Upload, Download, Eye, Filter, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UniversalTransactionForm } from "@/components/forms/UniversalTransactionForm";
import InvoiceReceiptService from "@/services/invoiceReceiptService";

export default function InvoicesReceipts() {
  const [invoiceReceipts, setInvoiceReceipts] = useState(InvoiceReceiptService.getAllInvoiceReceipts());
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

  const refreshData = () => {
    setInvoiceReceipts(InvoiceReceiptService.getAllInvoiceReceipts());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredInvoices = invoiceReceipts.filter(item => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = searchTerm === "" || 
      item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const summary = InvoiceReceiptService.getSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleExportCSV = () => {
    const csv = InvoiceReceiptService.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-receipts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
            <h1 className="text-2xl font-semibold">Invoices & Receipts Register</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsTransactionFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalSales)}
              </div>
              <div className="text-sm text-gray-600">Total Sales ({summary.totalInvoices} invoices)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalPurchases)}
              </div>
              <div className="text-sm text-gray-600">Total Purchases ({summary.totalReceipts} receipts)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{summary.outstandingInvoices}</div>
              <div className="text-sm text-gray-600">Outstanding Invoices</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice & Receipt Register
                <Badge variant="outline" className="ml-2">
                  Linked to Universal Transaction System
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="invoice">Invoices (Sales)</option>
                  <option value="receipt">Receipts (Purchases)</option>
                </select>
                <Input 
                  placeholder="Search..." 
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
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>TIN</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No invoices or receipts found. Start by creating a sale or purchase transaction.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.number}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'invoice' ? 'default' : 'secondary'}>
                          {item.type === 'invoice' ? 'Invoice' : 'Receipt'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.party_name}</TableCell>
                      <TableCell className="font-mono text-sm">{item.tin || '-'}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.vat)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <UniversalTransactionForm
          open={isTransactionFormOpen}
          onClose={() => setIsTransactionFormOpen(false)}
          onSuccess={refreshData}
        />
      </div>
    </div>
  );
}
