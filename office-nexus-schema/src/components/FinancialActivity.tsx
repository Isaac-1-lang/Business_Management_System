
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import UniversalTransactionService from "@/services/universalTransactionService";
import AccountingService from "@/services/accountingService";

export function FinancialActivity() {
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyGrowth: 0,
    cashFlow: 0,
    pendingInvoices: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const transactions = UniversalTransactionService.getTransactionsByDateRange(
        firstDayOfMonth.toISOString().split('T')[0],
        lastDayOfMonth.toISOString().split('T')[0]
      );

      const revenue = transactions
        .filter(t => t.type === 'sale' || t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense' || t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = revenue - expenses;

      // Get previous month for growth calculation
      const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      const previousTransactions = UniversalTransactionService.getTransactionsByDateRange(
        previousMonthStart.toISOString().split('T')[0],
        previousMonthEnd.toISOString().split('T')[0]
      );

      const previousRevenue = previousTransactions
        .filter(t => t.type === 'sale' || t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyGrowth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Get cash flow (simplified)
      const cashTransactions = transactions.filter(t => t.payment_method === 'cash' || t.payment_method === 'bank');
      const cashFlow = cashTransactions.reduce((sum, t) => {
        return t.type === 'sale' || t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);

      setFinancialData({
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit,
        monthlyGrowth,
        cashFlow,
        pendingInvoices: 3 // This would come from invoice service
      });
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Activity</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Financial Activity</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Net Profit (This Month)</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium text-green-600">
                {formatCurrency(financialData.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
            <div>
              <div className="font-medium text-red-600">
                {formatCurrency(financialData.totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground">Expenses</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Cash Flow:</span>
              <span className={`font-medium ${financialData.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financialData.cashFlow)}
              </span>
            </div>
            
            {financialData.pendingInvoices > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Pending Invoices:</span>
                <span className="text-orange-600">{financialData.pendingInvoices}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              {financialData.monthlyGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={financialData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(financialData.monthlyGrowth).toFixed(1)}% vs last month
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/reports-audit'}>
              <Eye className="w-3 h-3 mr-1" />
              View Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
