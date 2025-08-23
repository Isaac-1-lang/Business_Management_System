import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LockedCapital {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  currency: string;
  lockPeriod: number; // in months
  lockDate: string;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'early_withdrawal_requested';
  earlyWithdrawalPenalty?: number;
  roiRate: number;
  accruedInterest: number;
  notes?: string;
}

interface EarlyWithdrawalRequest {
  id: string;
  lockedCapitalId: string;
  requestDate: string;
  reason: string;
  penaltyAmount: number;
  status: 'pending' | 'approved' | 'rejected';
}

const LOCK_PERIODS = [
  { value: '3', label: '3 Months', bonusRate: 0.5 },
  { value: '6', label: '6 Months', bonusRate: 1.0 },
  { value: '12', label: '1 Year', bonusRate: 2.0 },
  { value: '18', label: '1.5 Years', bonusRate: 2.5 },
  { value: '24', label: '2 Years', bonusRate: 3.0 },
  { value: '36', label: '3 Years', bonusRate: 4.0 }
];

export function CapitalLockingSystem() {
  const { toast } = useToast();
  const [lockedCapitals, setLockedCapitals] = useState<LockedCapital[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<EarlyWithdrawalRequest[]>([]);
  const [showLockDialog, setShowLockDialog] = useState(false);
  
  // Form state
  const [investorName, setInvestorName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('RWF');
  const [lockPeriod, setLockPeriod] = useState('12');
  const [baseRoiRate, setBaseRoiRate] = useState('8');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const saved = localStorage.getItem('locked_capitals');
    const savedRequests = localStorage.getItem('withdrawal_requests');
    
    if (saved) {
      setLockedCapitals(JSON.parse(saved));
    }
    if (savedRequests) {
      setWithdrawalRequests(JSON.parse(savedRequests));
    }
  };

  const saveData = (capitals: LockedCapital[], requests: EarlyWithdrawalRequest[]) => {
    localStorage.setItem('locked_capitals', JSON.stringify(capitals));
    localStorage.setItem('withdrawal_requests', JSON.stringify(requests));
    setLockedCapitals(capitals);
    setWithdrawalRequests(requests);
  };

  const calculateUnlockDate = (lockDate: string, months: number): string => {
    const date = new Date(lockDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  const calculateAccruedInterest = (capital: LockedCapital): number => {
    const lockDate = new Date(capital.lockDate);
    const now = new Date();
    const monthsElapsed = (now.getTime() - lockDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const annualRate = capital.roiRate / 100;
    const monthlyRate = annualRate / 12;
    
    return capital.amount * monthlyRate * monthsElapsed;
  };

  const handleLockCapital = () => {
    if (!investorName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values",
        variant: "destructive"
      });
      return;
    }

    const lockPeriodData = LOCK_PERIODS.find(p => p.value === lockPeriod);
    const finalRoiRate = Number(baseRoiRate) + (lockPeriodData?.bonusRate || 0);
    
    const now = new Date().toISOString();
    const unlockDate = calculateUnlockDate(now, Number(lockPeriod));
    
    const newLockedCapital: LockedCapital = {
      id: Date.now().toString(),
      investorId: Date.now().toString(),
      investorName,
      amount: Number(amount),
      currency,
      lockPeriod: Number(lockPeriod),
      lockDate: now,
      unlockDate,
      status: 'locked',
      roiRate: finalRoiRate,
      accruedInterest: 0
    };

    const updatedCapitals = [...lockedCapitals, newLockedCapital];
    saveData(updatedCapitals, withdrawalRequests);
    
    toast({
      title: "Capital Locked Successfully",
      description: `${amount} ${currency} locked for ${lockPeriod} months at ${finalRoiRate}% ROI`
    });

    // Reset form
    setInvestorName('');
    setAmount('');
    setShowLockDialog(false);
  };

  const requestEarlyWithdrawal = (capitalId: string, reason: string) => {
    const capital = lockedCapitals.find(c => c.id === capitalId);
    if (!capital) return;

    const penaltyPercentage = 0.05; // 5% penalty
    const penaltyAmount = capital.amount * penaltyPercentage;
    
    const request: EarlyWithdrawalRequest = {
      id: Date.now().toString(),
      lockedCapitalId: capitalId,
      requestDate: new Date().toISOString(),
      reason,
      penaltyAmount,
      status: 'pending'
    };

    const updatedCapitals = lockedCapitals.map(c =>
      c.id === capitalId ? { ...c, status: 'early_withdrawal_requested' as const } : c
    );
    const updatedRequests = [...withdrawalRequests, request];

    saveData(updatedCapitals, updatedRequests);
    
    toast({
      title: "Withdrawal Request Submitted",
      description: `Early withdrawal request submitted with ${(penaltyPercentage * 100)}% penalty`
    });
  };

  const processEarlyWithdrawal = (requestId: string, approve: boolean) => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequests = withdrawalRequests.map(r =>
      r.id === requestId ? { ...r, status: approve ? 'approved' as const : 'rejected' as const } : r
    );

    let updatedCapitals = lockedCapitals;
    if (approve) {
      updatedCapitals = lockedCapitals.map(c =>
        c.id === request.lockedCapitalId ? { ...c, status: 'unlocked' as const } : c
      );
    } else {
      updatedCapitals = lockedCapitals.map(c =>
        c.id === request.lockedCapitalId ? { ...c, status: 'locked' as const } : c
      );
    }

    saveData(updatedCapitals, updatedRequests);
    
    toast({
      title: approve ? "Withdrawal Approved" : "Withdrawal Rejected",
      description: approve ? "Early withdrawal has been processed" : "Withdrawal request has been rejected"
    });
  };

  const checkMaturedCapitals = () => {
    const now = new Date();
    const updatedCapitals = lockedCapitals.map(capital => {
      const unlockDate = new Date(capital.unlockDate);
      if (now >= unlockDate && capital.status === 'locked') {
        return { ...capital, status: 'unlocked' as const };
      }
      return capital;
    });

    if (updatedCapitals.some((capital, index) => capital.status !== lockedCapitals[index].status)) {
      saveData(updatedCapitals, withdrawalRequests);
      toast({
        title: "Capital Matured",
        description: "Some locked capital has reached maturity and is now available for withdrawal"
      });
    }
  };

  // Check for matured capitals on component mount and periodically
  useEffect(() => {
    checkMaturedCapitals();
    const interval = setInterval(checkMaturedCapitals, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lockedCapitals]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return `${amount.toLocaleString()} ${currencyCode}`;
  };

  const getTimeRemaining = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return 'Unlocked';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    }
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  };

  const getProgressPercentage = (lockDate: string, unlockDate: string) => {
    const now = new Date();
    const lock = new Date(lockDate);
    const unlock = new Date(unlockDate);
    
    const totalTime = unlock.getTime() - lock.getTime();
    const elapsedTime = now.getTime() - lock.getTime();
    
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  const totalLockedAmount = lockedCapitals.reduce((sum, capital) => {
    // Convert to RWF for simplicity (you could make this more sophisticated)
    const rate = capital.currency === 'USD' ? 1250 : capital.currency === 'EUR' ? 1350 : 1;
    return sum + (capital.amount * rate);
  }, 0);

  const activeLockedCapitals = lockedCapitals.filter(c => c.status === 'locked');
  const matureCapitals = lockedCapitals.filter(c => c.status === 'unlocked');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {activeLockedCapitals.length}
                </div>
                <div className="text-sm text-blue-700">Active Locks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalLockedAmount, 'RWF')}
                </div>
                <div className="text-sm text-green-700">Total Locked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {matureCapitals.length}
                </div>
                <div className="text-sm text-orange-700">Matured</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {withdrawalRequests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-purple-700">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lock New Capital Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Capital Locking System</h2>
        <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Lock className="w-4 h-4 mr-2" />
              Lock New Capital
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lock Capital Investment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Investor Name</Label>
                <Input
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="Enter investor name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lock Period</Label>
                  <Select value={lockPeriod} onValueChange={setLockPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCK_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label} (+{period.bonusRate}% ROI)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base ROI Rate (%)</Label>
                  <Input
                    type="number"
                    value={baseRoiRate}
                    onChange={(e) => setBaseRoiRate(e.target.value)}
                    placeholder="Base ROI %"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Final ROI Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Number(baseRoiRate) + (LOCK_PERIODS.find(p => p.value === lockPeriod)?.bonusRate || 0)}%
                </div>
              </div>
              
              <Button onClick={handleLockCapital} className="w-full">
                Lock Capital
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locked Capitals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Locked Capital Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {lockedCapitals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locked capital yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>ROI Rate</TableHead>
                  <TableHead>Lock Period</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lockedCapitals.map((capital) => (
                  <TableRow key={capital.id}>
                    <TableCell className="font-medium">
                      {capital.investorName}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(capital.amount, capital.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{capital.roiRate}%</Badge>
                    </TableCell>
                    <TableCell>
                      {capital.lockPeriod} months
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress 
                          value={getProgressPercentage(capital.lockDate, capital.unlockDate)} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500">
                          {getTimeRemaining(capital.unlockDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        capital.status === 'locked' ? 'bg-blue-100 text-blue-700' :
                        capital.status === 'unlocked' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {capital.status === 'locked' ? 'Locked' :
                         capital.status === 'unlocked' ? 'Available' : 'Withdrawal Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {capital.status === 'locked' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestEarlyWithdrawal(capital.id, 'Emergency withdrawal')}
                        >
                          Request Early Withdrawal
                        </Button>
                      )}
                      {capital.status === 'unlocked' && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready for Withdrawal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Withdrawal Requests */}
      {withdrawalRequests.filter(r => r.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Pending Early Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Penalty Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests
                  .filter(r => r.status === 'pending')
                  .map((request) => {
                    const capital = lockedCapitals.find(c => c.id === request.lockedCapitalId);
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {capital?.investorName}
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {formatCurrency(request.penaltyAmount, capital?.currency || 'RWF')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => processEarlyWithdrawal(request.id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => processEarlyWithdrawal(request.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}