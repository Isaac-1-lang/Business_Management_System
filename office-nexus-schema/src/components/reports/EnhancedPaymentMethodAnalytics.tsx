
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CreditCard, Smartphone, Building, DollarSign, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UniversalTransactionHandler from '@/services/universalTransactionHandler';
import PaymentSummaryCards from './payment/PaymentSummaryCards';

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  percentage: number;
  icon: any;
  color: string;
}

export default function EnhancedPaymentMethodAnalytics() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30');
  const [paymentData, setPaymentData] = useState<PaymentMethodData[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadPaymentAnalytics();
  }, [timeRange]);

  const loadPaymentAnalytics = async () => {
    try {
      const fromDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
      const transactions = await UniversalTransactionHandler.getTransactionHistory({
        date_from: fromDate.toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0]
      });

      const paymentMethods = transactions.reduce((acc, transaction) => {
        const method = transaction.payment_method || 'unknown';
        if (!acc[method]) {
          acc[method] = { amount: 0, count: 0 };
        }
        acc[method].amount += transaction.amount;
        acc[method].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

      const total = Object.values(paymentMethods).reduce((sum, data) => sum + data.amount, 0);
      setTotalAmount(total);

      const methodIcons = {
        cash: DollarSign,
        bank: Building,
        mobile_money: Smartphone,
        card: CreditCard,
        cheque: Building
      };

      const methodColors = {
        cash: '#10B981',
        bank: '#3B82F6',
        mobile_money: '#F59E0B',
        card: '#8B5CF6',
        cheque: '#6B7280'
      };

      const formattedData: PaymentMethodData[] = Object.entries(paymentMethods).map(([method, data]) => ({
        method: method.replace('_', ' ').toUpperCase(),
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        icon: methodIcons[method as keyof typeof methodIcons] || DollarSign,
        color: methodColors[method as keyof typeof methodColors] || '#6B7280'
      }));

      setPaymentData(formattedData);
    } catch (error) {
      console.error('Payment analytics error:', error);
    }
  };

  const exportReport = () => {
    const csvContent = [
      'Payment Method,Amount (RWF),Transaction Count,Percentage',
      ...paymentData.map(item => [
        item.method,
        item.amount.toFixed(2),
        item.count,
        item.percentage.toFixed(1) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-methods-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Payment methods report downloaded successfully",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      </Card>

      <PaymentSummaryCards
        totalAmount={totalAmount}
        paymentData={paymentData}
        formatCurrency={formatCurrency}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment Method</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Transaction Count</th>
                  <th className="text-right p-2">Average Transaction</th>
                  <th className="text-right p-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((method) => (
                  <tr key={method.method} className="border-b hover:bg-gray-50">
                    <td className="p-2 flex items-center gap-2">
                      <method.icon className="w-4 h-4" style={{ color: method.color }} />
                      {method.method}
                    </td>
                    <td className="text-right p-2 font-mono">{formatCurrency(method.amount)}</td>
                    <td className="text-right p-2">{method.count}</td>
                    <td className="text-right p-2 font-mono">
                      {formatCurrency(method.count > 0 ? method.amount / method.count : 0)}
                    </td>
                    <td className="text-right p-2">{method.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
