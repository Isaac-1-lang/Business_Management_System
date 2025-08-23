import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, RefreshCw, TrendingUp, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate to RWF
}

interface CurrencyTransaction {
  id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
  date: string;
  type: 'investment' | 'withdrawal' | 'return';
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1250 }, // Example rates
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 1350 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1580 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 9.5 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 0.33 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 0.53 }
];

export function MultiCurrencyManager() {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>(SUPPORTED_CURRENCIES);
  const [transactions, setTransactions] = useState<CurrencyTransaction[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('RWF');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency, currencies]);

  const loadTransactions = () => {
    const saved = localStorage.getItem('currency_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  };

  const saveTransactions = (newTransactions: CurrencyTransaction[]) => {
    localStorage.setItem('currency_transactions', JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  const calculateConversion = () => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount(0);
      return;
    }

    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    
    // Convert to RWF first, then to target currency
    const rwfAmount = Number(amount) * fromRate;
    const converted = rwfAmount / toRate;
    
    setConvertedAmount(Math.round(converted * 100) / 100);
  };

  const handleConvert = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
    const toCurrencyData = currencies.find(c => c.code === toCurrency);
    
    if (!fromCurrencyData || !toCurrencyData) return;

    const rate = fromCurrencyData.rate / toCurrencyData.rate;
    
    const newTransaction: CurrencyTransaction = {
      id: Date.now().toString(),
      amount: Number(amount),
      fromCurrency,
      toCurrency,
      rate,
      convertedAmount,
      date: new Date().toISOString(),
      type: 'investment'
    };

    saveTransactions([newTransaction, ...transactions]);
    
    toast({
      title: "Conversion Recorded",
      description: `Converted ${formatCurrency(Number(amount), fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)}`
    });

    setAmount('');
  };

  const updateExchangeRates = async () => {
    setIsUpdatingRates(true);
    
    // Simulate API call to get real exchange rates
    setTimeout(() => {
      const updatedCurrencies = currencies.map(currency => {
        if (currency.code === 'RWF') return currency;
        
        // Simulate rate fluctuation ±2%
        const fluctuation = 0.96 + (Math.random() * 0.08);
        return {
          ...currency,
          rate: Math.round(currency.rate * fluctuation)
        };
      });
      
      setCurrencies(updatedCurrencies);
      setIsUpdatingRates(false);
      
      toast({
        title: "Exchange Rates Updated",
        description: "All currency rates have been refreshed"
      });
    }, 2000);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return `${currency?.symbol || currencyCode} ${amount.toLocaleString()}`;
  };

  const getPortfolioSummary = () => {
    const summary = transactions.reduce((acc, transaction) => {
      const currency = transaction.toCurrency;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += transaction.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(summary).map(([currency, amount]) => ({
      currency,
      amount,
      rwfValue: amount * (currencies.find(c => c.code === currency)?.rate || 1)
    }));
  };

  const portfolioSummary = getPortfolioSummary();
  const totalPortfolioRWF = portfolioSummary.reduce((sum, item) => sum + item.rwfValue, 0);

  return (
    <div className="space-y-6">
      {/* Currency Converter */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Multi-Currency Converter
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={updateExchangeRates}
              disabled={isUpdatingRates}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingRates ? 'animate-spin' : ''}`} />
              Update Rates
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col justify-end">
              <Button onClick={handleConvert} className="bg-green-600 hover:bg-green-700">
                Convert
              </Button>
            </div>
          </div>
          
          {convertedAmount > 0 && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(convertedAmount, toCurrency)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(Number(amount) || 0, fromCurrency)} = {formatCurrency(convertedAmount, toCurrency)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      {portfolioSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Multi-Currency Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {portfolioSummary.length}
                </div>
                <div className="text-sm text-blue-700">Currencies</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPortfolioRWF, 'RWF')}
                </div>
                <div className="text-sm text-green-700">Total Value (RWF)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {transactions.length}
                </div>
                <div className="text-sm text-purple-700">Transactions</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {portfolioSummary.map((item) => (
                <div key={item.currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{item.currency}</div>
                      <div className="text-sm text-gray-600">{formatCurrency(item.amount, item.currency)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {formatCurrency(item.rwfValue, 'RWF')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Exchange Rates (vs RWF)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rate (to RWF)</TableHead>
                <TableHead>1 RWF equals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">
                    {currency.symbol} {currency.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{currency.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {currency.code === 'RWF' ? '1.00' : currency.rate.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {currency.code === 'RWF' ? '1.00' : (1 / currency.rate).toFixed(6)} {currency.code}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Currency Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transaction.amount, transaction.fromCurrency)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transaction.convertedAmount, transaction.toCurrency)}
                    </TableCell>
                    <TableCell>
                      {transaction.rate.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === 'investment' ? 'default' :
                        transaction.type === 'withdrawal' ? 'destructive' : 'secondary'
                      }>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}