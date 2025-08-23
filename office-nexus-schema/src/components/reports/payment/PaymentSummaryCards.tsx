
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  percentage: number;
  icon: any;
  color: string;
}

interface PaymentSummaryCardsProps {
  totalAmount: number;
  paymentData: PaymentMethodData[];
  formatCurrency: (amount: number) => string;
}

export default function PaymentSummaryCards({
  totalAmount,
  paymentData,
  formatCurrency
}: PaymentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {paymentData.slice(0, 3).map((method, index) => {
        const IconComponent = method.icon;
        return (
          <Card key={method.method}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: method.color + '20' }}>
                  <IconComponent className="w-6 h-6" style={{ color: method.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(method.amount)}</div>
                  <div className="text-sm text-gray-600">{method.method}</div>
                  <div className="text-xs text-gray-500">{method.percentage.toFixed(1)}% of total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
