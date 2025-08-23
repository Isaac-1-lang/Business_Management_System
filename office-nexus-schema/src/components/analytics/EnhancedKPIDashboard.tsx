import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';
import UniversalTransactionService from '@/services/universalTransactionService';

interface KPIMetric {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  format: 'currency' | 'number' | 'percentage';
}

interface ChartDataPoint {
  name: string;
  value: number;
  trend?: number;
  category?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function EnhancedKPIDashboard() {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [expenseData, setExpenseData] = useState<ChartDataPoint[]>([]);
  const [profitabilityData, setProfitabilityData] = useState<ChartDataPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = () => {
    const transactions = UniversalTransactionService.getAllTransactions();
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    );

    // Calculate KPI metrics
    const currentPeriodTransactions = filteredTransactions;
    const previousPeriodStart = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodTransactions = transactions.filter(t => 
      new Date(t.date) >= previousPeriodStart && new Date(t.date) < startDate
    );

    const metrics = calculateKPIMetrics(currentPeriodTransactions, previousPeriodTransactions);
    setKpiMetrics(metrics);

    // Generate chart data
    setRevenueData(generateRevenueData(currentPeriodTransactions, daysBack));
    setExpenseData(generateExpenseData(currentPeriodTransactions, daysBack));
    setProfitabilityData(generateProfitabilityData(currentPeriodTransactions, daysBack));
    setCategoryBreakdown(generateCategoryBreakdown(currentPeriodTransactions));
  };

  const calculateKPIMetrics = (current: any[], previous: any[]): KPIMetric[] => {
    const currentRevenue = current
      .filter(t => t.type === 'sale' || t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousRevenue = previous
      .filter(t => t.type === 'sale' || t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = current
      .filter(t => t.type === 'expense' || t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpenses = previous
      .filter(t => t.type === 'expense' || t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentProfit = currentRevenue - currentExpenses;
    const previousProfit = previousRevenue - previousExpenses;

    const currentTransactionCount = current.length;
    const previousTransactionCount = previous.length;

    const profitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
    const previousProfitMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0;

    return [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: currentRevenue,
        previousValue: previousRevenue,
        change: currentRevenue - previousRevenue,
        changePercent: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        trend: currentRevenue >= previousRevenue ? 'up' : 'down',
        icon: DollarSign,
        color: 'text-green-600',
        format: 'currency'
      },
      {
        id: 'expenses',
        title: 'Total Expenses',
        value: currentExpenses,
        previousValue: previousExpenses,
        change: currentExpenses - previousExpenses,
        changePercent: previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0,
        trend: currentExpenses <= previousExpenses ? 'up' : 'down',
        icon: TrendingDown,
        color: 'text-red-600',
        format: 'currency'
      },
      {
        id: 'profit',
        title: 'Net Profit',
        value: currentProfit,
        previousValue: previousProfit,
        change: currentProfit - previousProfit,
        changePercent: Math.abs(previousProfit) > 0 ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0,
        trend: currentProfit >= previousProfit ? 'up' : 'down',
        icon: TrendingUp,
        color: currentProfit >= 0 ? 'text-green-600' : 'text-red-600',
        format: 'currency'
      },
      {
        id: 'transactions',
        title: 'Total Transactions',
        value: currentTransactionCount,
        previousValue: previousTransactionCount,
        change: currentTransactionCount - previousTransactionCount,
        changePercent: previousTransactionCount > 0 ? ((currentTransactionCount - previousTransactionCount) / previousTransactionCount) * 100 : 0,
        trend: currentTransactionCount >= previousTransactionCount ? 'up' : 'down',
        icon: Activity,
        color: 'text-blue-600',
        format: 'number'
      },
      {
        id: 'profit_margin',
        title: 'Profit Margin',
        value: profitMargin,
        previousValue: previousProfitMargin,
        change: profitMargin - previousProfitMargin,
        changePercent: Math.abs(previousProfitMargin) > 0 ? ((profitMargin - previousProfitMargin) / Math.abs(previousProfitMargin)) * 100 : 0,
        trend: profitMargin >= previousProfitMargin ? 'up' : 'down',
        icon: Target,
        color: profitMargin >= 0 ? 'text-green-600' : 'text-red-600',
        format: 'percentage'
      },
      {
        id: 'avg_transaction',
        title: 'Avg Transaction Value',
        value: currentTransactionCount > 0 ? currentRevenue / currentTransactionCount : 0,
        previousValue: previousTransactionCount > 0 ? previousRevenue / previousTransactionCount : 0,
        change: 0,
        changePercent: 0,
        trend: 'neutral',
        icon: BarChart3,
        color: 'text-purple-600',
        format: 'currency'
      }
    ];
  };

  const generateRevenueData = (transactions: any[], days: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const interval = days <= 30 ? 1 : Math.ceil(days / 30);
    
    for (let i = 0; i < days; i += interval) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      });
      
      const revenue = dayTransactions
        .filter(t => t.type === 'sale' || t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: revenue
      });
    }
    
    return data;
  };

  const generateExpenseData = (transactions: any[], days: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const interval = days <= 30 ? 1 : Math.ceil(days / 30);
    
    for (let i = 0; i < days; i += interval) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      });
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense' || t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: expenses
      });
    }
    
    return data;
  };

  const generateProfitabilityData = (transactions: any[], days: number): ChartDataPoint[] => {
    const revenueData = generateRevenueData(transactions, days);
    const expenseData = generateExpenseData(transactions, days);
    
    return revenueData.map((item, index) => ({
      name: item.name,
      value: item.value - (expenseData[index]?.value || 0),
      trend: item.value - (expenseData[index]?.value || 0)
    }));
  };

  const generateCategoryBreakdown = (transactions: any[]): ChartDataPoint[] => {
    const categoryTotals: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || transaction.type || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });
    
    return Object.entries(categoryTotals)
      .map(([category, value]) => ({ name: category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const formatValue = (value: number, format: 'currency' | 'number' | 'percentage') => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString()} RWF`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const formatChange = (change: number, changePercent: number, format: 'currency' | 'number' | 'percentage') => {
    const prefix = change >= 0 ? '+' : '';
    const formattedChange = format === 'currency' ? 
      `${prefix}${change.toLocaleString()} RWF` : 
      `${prefix}${change.toLocaleString()}`;
    const formattedPercent = `${prefix}${changePercent.toFixed(1)}%`;
    
    return `${formattedChange} (${formattedPercent})`;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="365d">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className={`text-3xl font-bold ${metric.color}`}>
                      {formatValue(metric.value, metric.format)}
                    </p>
                    <div className="flex items-center mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatChange(metric.change, metric.changePercent, metric.format)}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${
                    metric.color.includes('green') ? 'bg-green-100' :
                    metric.color.includes('red') ? 'bg-red-100' :
                    metric.color.includes('blue') ? 'bg-blue-100' :
                    metric.color.includes('purple') ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} RWF`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Expense Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} RWF`, 'Expenses']} />
                    <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Profitability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} RWF`, 'Profit']} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Transaction Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}K`}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} RWF`, 'Amount']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}