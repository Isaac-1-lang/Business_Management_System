
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Download, Calendar, DollarSign } from 'lucide-react';
import UniversalTransactionService from '@/services/universalTransactionService';

export default function IncomeBreakdown() {
  const [incomeData, setIncomeData] = useState<Array<{
    source: string;
    label: string;
    amount: number;
    percentage: number;
    count: number;
  }>>([]);
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadIncomeBreakdown();
  }, [fromDate, toDate]);

  const loadIncomeBreakdown = () => {
    const breakdown = UniversalTransactionService.getIncomeBreakdown(fromDate, toDate);
    setIncomeData(breakdown);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportBreakdown = () => {
    const csvContent = [
      'Income Source,Amount (RWF),Percentage,Count',
      ...incomeData.map(item => [
        item.label,
        item.amount.toFixed(2),
        item.percentage.toFixed(1) + '%',
        item.count
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-breakdown-${fromDate}-to-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const operatingIncome = incomeData.find(item => item.source === 'sales')?.amount || 0;
  const nonOperatingIncome = totalAmount - operatingIncome;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Income Source Breakdown
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportBreakdown}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Total Income</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(operatingIncome)}
                  </div>
                  <div className="text-sm text-gray-600">Operating Income</div>
                  <div className="text-xs text-gray-500">
                    {totalAmount > 0 ? ((operatingIncome / totalAmount) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(nonOperatingIncome)}
                  </div>
                  <div className="text-sm text-gray-600">Non-Operating Income</div>
                  <div className="text-xs text-gray-500">
                    {totalAmount > 0 ? ((nonOperatingIncome / totalAmount) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percentage }) => `${label}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Income Source</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Percentage</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Count</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomeData.map((item, index) => (
                      <tr key={item.source} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{item.label}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {item.percentage.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right">{item.count}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={item.source === 'sales' ? 'default' : 'secondary'}>
                            {item.source === 'sales' ? 'Operating' : 'Non-Operating'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Legal Compliance Notes */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Legal & Tax Compliance Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700 space-y-2">
              <p><strong>Operating vs Non-Operating:</strong> Distinction is important for financial statement presentation per IAS 1.</p>
              <p><strong>Loans:</strong> Should be recorded as liabilities, not revenue - ensure proper documentation.</p>
              <p><strong>Gifts/Donations:</strong> May have tax implications depending on regularity and amount.</p>
              <p><strong>Grants:</strong> Often come with reporting requirements and restrictions on use.</p>
              <p><strong>Sales:</strong> Must maintain proper invoicing and VAT compliance if registered.</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
