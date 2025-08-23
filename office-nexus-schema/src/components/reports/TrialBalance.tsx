
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import TransactionEngine from '@/services/transactionEngine';

interface TrialBalanceEntry {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function TrialBalance() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceEntry[]>([]);
  const [filteredBalance, setFilteredBalance] = useState<TrialBalanceEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTrialBalance();
  }, [asOfDate]);

  useEffect(() => {
    applyFilters();
  }, [trialBalance, searchQuery, accountTypeFilter]);

  const loadTrialBalance = () => {
    const balance = TransactionEngine.getTrialBalance(asOfDate);
    setTrialBalance(balance);
  };

  const applyFilters = () => {
    let filtered = [...trialBalance];

    // Filter by account type
    if (accountTypeFilter !== 'all') {
      const typePrefix = {
        assets: '1',
        liabilities: '2',
        equity: '3',
        revenue: '4',
        expenses: '5'
      }[accountTypeFilter];

      if (typePrefix) {
        filtered = filtered.filter(entry => entry.account_code.startsWith(typePrefix));
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.account_name.toLowerCase().includes(query) ||
        entry.account_code.includes(query)
      );
    }

    setFilteredBalance(filtered);
  };

  const getTotals = () => {
    return filteredBalance.reduce(
      (acc, entry) => ({
        totalDebits: acc.totalDebits + entry.debit,
        totalCredits: acc.totalCredits + entry.credit
      }),
      { totalDebits: 0, totalCredits: 0 }
    );
  };

  const isBalanced = () => {
    const { totalDebits, totalCredits } = getTotals();
    return Math.abs(totalDebits - totalCredits) < 0.01;
  };

  const exportTrialBalance = () => {
    const { totalDebits, totalCredits } = getTotals();
    
    const csvContent = [
      'Account Code,Account Name,Debit,Credit,Balance',
      ...filteredBalance.map(entry => [
        entry.account_code,
        entry.account_name,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2),
        entry.balance.toFixed(2)
      ].join(',')),
      '',
      `Total,${totalDebits.toFixed(2)},${totalCredits.toFixed(2)},`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${asOfDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const { totalDebits, totalCredits } = getTotals();

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Trial Balance
          </CardTitle>
          <div className="flex items-center gap-2">
            {isBalanced() ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Balanced
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Out of Balance
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={exportTrialBalance}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-60"
            />
          </div>

          <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="assets">Assets (1xxx)</SelectItem>
              <SelectItem value="liabilities">Liabilities (2xxx)</SelectItem>
              <SelectItem value="equity">Equity (3xxx)</SelectItem>
              <SelectItem value="revenue">Revenue (4xxx)</SelectItem>
              <SelectItem value="expenses">Expenses (5xxx)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalDebits)}
                  </div>
                  <div className="text-sm text-gray-600">Total Debits</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalCredits)}
                  </div>
                  <div className="text-sm text-gray-600">Total Credits</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isBalanced() ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </div>
                  <div className="text-sm text-gray-600">Difference</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trial Balance Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Account Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Account Name</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Debit</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Credit</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBalance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No accounts found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredBalance.map((entry) => (
                      <tr key={entry.account_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{entry.account_code}</td>
                        <td className="px-4 py-3 text-sm">{entry.account_name}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-mono ${
                          entry.balance > 0 ? 'text-green-600' : entry.balance < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {entry.balance !== 0 ? formatCurrency(entry.balance) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-900">
                  <tr className="font-semibold">
                    <td colSpan={2} className="px-4 py-3 text-sm">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatCurrency(totalCredits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {!isBalanced() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Trial Balance Out of Balance</h3>
                  <p className="text-sm">
                    The total debits and credits do not match. Please review your journal entries.
                    Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
