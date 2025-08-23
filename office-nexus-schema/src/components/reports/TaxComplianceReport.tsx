import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import UniversalTransactionService from "@/services/universalTransactionService";
import TaxCategoryService from "@/services/taxCategoryService";

export default function TaxComplianceReport() {
  const taxSummary = UniversalTransactionService.getTaxCategorySummary(
    "2024-01-01", 
    "2024-12-31"
  );

  const totalDeductible = taxSummary
    .filter(item => item.deductible)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalNonDeductible = taxSummary
    .filter(item => !item.deductible)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = totalDeductible + totalNonDeductible;

  const pieData = [
    { name: 'Deductible Expenses', value: totalDeductible, color: '#22c55e' },
    { name: 'Non-Deductible Expenses', value: totalNonDeductible, color: '#ef4444' }
  ];

  const topCategories = taxSummary.slice(0, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExportCSV = () => {
    const headers = ['Tax Category', 'Label (EN)', 'Amount (RWF)', 'Count', 'Deductible', 'Percentage'];
    const csvData = [
      headers.join(','),
      ...taxSummary.map(item => [
        item.category,
        `"${item.label}"`,
        item.amount.toFixed(2),
        item.count,
        item.deductible ? 'Yes' : 'No',
        item.percentage.toFixed(2) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Tax Compliance Report
          </h2>
          <p className="text-gray-600">RRA-compliant expense categorization and deductibility analysis</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalDeductible)}
            </div>
            <div className="text-sm text-gray-600">Tax Deductible Expenses</div>
            <div className="text-xs text-green-600 mt-1">
              {totalExpenses > 0 ? ((totalDeductible / totalExpenses) * 100).toFixed(1) : 0}% of total
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalNonDeductible)}
            </div>
            <div className="text-sm text-gray-600">Non-Deductible Expenses</div>
            <div className="text-xs text-red-600 mt-1">
              {totalExpenses > 0 ? ((totalNonDeductible / totalExpenses) * 100).toFixed(1) : 0}% of total
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-xs text-gray-600 mt-1">
              {taxSummary.reduce((sum, item) => sum + item.count, 0)} transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {taxSummary.length}
            </div>
            <div className="text-sm text-gray-600">Categories Used</div>
            <div className="text-xs text-blue-600 mt-1">
              Out of {TaxCategoryService.getAllCategories().length} available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deductibility Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Deductibility Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value}) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis 
                    type="category" 
                    dataKey="label" 
                    width={120} 
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount">
                    {topCategories.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.deductible ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalNonDeductible > totalDeductible && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">High Non-Deductible Expenses</p>
                  <p className="text-sm text-red-600">
                    Non-deductible expenses ({formatCurrency(totalNonDeductible)}) exceed deductible ones. 
                    Review categorization for tax optimization.
                  </p>
                </div>
              </div>
            )}
            
            {taxSummary.some(item => item.category === 'charity_expense' && item.amount > 50000) && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-800">Charity Expense Limit</p>
                  <p className="text-sm text-yellow-600">
                    Charitable donations have tax deduction limits under Rwanda tax law. Verify compliance.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Proper Categorization</p>
                <p className="text-sm text-green-600">
                  All expenses are properly categorized according to RRA tax classifications.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>English Label</TableHead>
                <TableHead>Kinyarwanda</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead>Tax Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxSummary.map((item) => {
                const category = TaxCategoryService.getCategory(item.category);
                return (
                  <TableRow key={item.category}>
                    <TableCell className="font-mono text-sm">{item.category}</TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {category?.label_rw || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={item.deductible ? "default" : "destructive"}>
                        {item.deductible ? "Deductible" : "Non-deductible"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
