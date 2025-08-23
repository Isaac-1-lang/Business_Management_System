
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, CreditCard, Banknote, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import UniversalTransactionService from '@/services/universalTransactionService';

interface PaymentMethodSummary {
  method: string;
  count: number;
  totalAmount: number;
}

export default function PaymentMethodAnalytics() {
  const [paymentSummary, setPaymentSummary] = useState<PaymentMethodSummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  useEffect(() => {
    loadPaymentSummary();
  }, [selectedPeriod]);

  const loadPaymentSummary = () => {
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    const summary = UniversalTransactionService.getPaymentMethodSummary(fromDate, toDate);
    setPaymentSummary(summary);
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'bank transfer':
        return <Building2 className="w-4 h-4" />;
      case 'mtn mobile money':
      case 'airtel money':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '#22c55e';
      case 'bank transfer':
        return '#3b82f6';
      case 'mtn mobile money':
        return '#eab308';
      case 'airtel money':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pieData = paymentSummary.map(item => ({
    name: item.method,
    value: item.totalAmount,
    fill: getPaymentColor(item.method)
  }));

  const barData = paymentSummary.map(item => ({
    method: item.method.replace(' ', '\n'),
    amount: item.totalAmount,
    count: item.count
  }));

  const totalAmount = paymentSummary.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTransactions = paymentSummary.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Method Analytics</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="current-quarter">Current Quarter</SelectItem>
            <SelectItem value="current-year">Current Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalTransactions}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentSummary.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPaymentIcon(item.method)}
                    <div>
                      <div className="font-medium">{item.method}</div>
                      <div className="text-sm text-gray-600">{item.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.totalAmount)}</div>
                    <Badge variant="outline" className="text-xs">
                      {((item.totalAmount / totalAmount) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution by Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${((value / totalAmount) * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
