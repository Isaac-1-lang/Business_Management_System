import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ROIProjection {
  month: number;
  invested: number;
  returns: number;
  total: number;
  percentage: number;
}

export function ROISimulator() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [roiPercentage, setRoiPercentage] = useState<number[]>([8]);
  const [lockPeriod, setLockPeriod] = useState<string>('12');
  const [compoundFrequency, setCompoundFrequency] = useState<string>('monthly');
  const [projections, setProjections] = useState<ROIProjection[]>([]);

  useEffect(() => {
    calculateROI();
  }, [investmentAmount, roiPercentage, lockPeriod, compoundFrequency]);

  const calculateROI = () => {
    const roi = roiPercentage[0] / 100;
    const months = parseInt(lockPeriod);
    const monthlyRate = roi / 12;
    
    const data: ROIProjection[] = [];
    
    for (let month = 1; month <= months; month++) {
      let returns: number;
      let total: number;
      
      if (compoundFrequency === 'monthly') {
        total = investmentAmount * Math.pow(1 + monthlyRate, month);
        returns = total - investmentAmount;
      } else if (compoundFrequency === 'quarterly') {
        const quarterlyRate = roi / 4;
        const quarters = Math.floor(month / 3);
        total = investmentAmount * Math.pow(1 + quarterlyRate, quarters);
        returns = total - investmentAmount;
      } else {
        // Simple interest
        returns = investmentAmount * roi * (month / 12);
        total = investmentAmount + returns;
      }
      
      const percentage = (returns / investmentAmount) * 100;
      
      data.push({
        month,
        invested: investmentAmount,
        returns: Math.round(returns),
        total: Math.round(total),
        percentage: Math.round(percentage * 100) / 100
      });
    }
    
    setProjections(data);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const finalProjection = projections[projections.length - 1];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="w-5 h-5" />
            ROI Investment Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Investment Amount (RWF)</Label>
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Expected Annual ROI: {roiPercentage[0]}%</Label>
                <Slider
                  value={roiPercentage}
                  onValueChange={setRoiPercentage}
                  max={50}
                  min={1}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Investment Period</Label>
                <Select value={lockPeriod} onValueChange={setLockPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">1 Year</SelectItem>
                    <SelectItem value="18">1.5 Years</SelectItem>
                    <SelectItem value="24">2 Years</SelectItem>
                    <SelectItem value="36">3 Years</SelectItem>
                    <SelectItem value="60">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Compound Frequency</Label>
                <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Interest</SelectItem>
                    <SelectItem value="monthly">Monthly Compound</SelectItem>
                    <SelectItem value="quarterly">Quarterly Compound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {finalProjection && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Total Investment</span>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {formatCurrency(investmentAmount)}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Returns</span>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1 bg-green-100 text-green-700">
                  {formatCurrency(finalProjection.returns)}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Final Amount</span>
                </div>
                <Badge className="text-lg px-3 py-1 bg-blue-600 text-white">
                  {formatCurrency(finalProjection.total)}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">ROI Percentage</span>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1 border-orange-200 text-orange-700">
                  {finalProjection.percentage}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Chart */}
      {projections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Growth Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    label={{ value: 'Amount (RWF)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'invested' ? 'Investment' : name === 'returns' ? 'Returns' : 'Total Value'
                    ]}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="invested" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}