
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText } from "lucide-react";
import DividendService from "@/services/dividendService";
import DataIntegrationService from "@/services/dataIntegrationService";

interface DividendDeclarationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DividendDeclarationForm({ open, onClose, onSuccess }: DividendDeclarationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    profitAmount: "",
    dividendPercentage: "",
    declarationDate: new Date().toISOString().split('T')[0],
    approvedBy: ""
  });
  const [preview, setPreview] = useState<any>(null);

  const handleCalculatePreview = () => {
    if (!formData.profitAmount || !formData.dividendPercentage) {
      toast({
        title: "Error",
        description: "Please enter profit amount and dividend percentage",
        variant: "destructive"
      });
      return;
    }

    const profitAmount = parseFloat(formData.profitAmount);
    const dividendPercentage = parseFloat(formData.dividendPercentage);
    const dividendPool = profitAmount * (dividendPercentage / 100);

    // Get shareholders
    const shareholders = DataIntegrationService.getDirectorsData().filter(
      (person: any) => person.shares && parseFloat(person.shares) > 0
    );

    if (shareholders.length === 0) {
      toast({
        title: "Error",
        description: "No shareholders found in the register",
        variant: "destructive"
      });
      return;
    }

    const totalShares = shareholders.reduce((sum: number, shareholder: any) => 
      sum + parseFloat(shareholder.shares), 0
    );

    const perShareDividend = dividendPool / totalShares;

    const distributions = shareholders.map((shareholder: any) => ({
      name: shareholder.name,
      shares: parseFloat(shareholder.shares),
      amount: Math.round(parseFloat(shareholder.shares) * perShareDividend)
    }));

    setPreview({
      profitAmount,
      dividendPercentage,
      dividendPool,
      totalShares,
      perShareDividend,
      distributions
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preview) {
      toast({
        title: "Error",
        description: "Please calculate preview first",
        variant: "destructive"
      });
      return;
    }

    try {
      const declaration = DividendService.createDividendDeclaration({
        company_id: localStorage.getItem('selectedCompanyId') || 'comp-001',
        profit_amount: preview.profitAmount,
        dividend_percentage: preview.dividendPercentage,
        approved_by: formData.approvedBy,
        declaration_date: formData.declarationDate,
        status: 'draft'
      });

      // Calculate distributions
      DividendService.calculateDividendDistribution(declaration.id);

      toast({
        title: "Success",
        description: "Dividend declaration created successfully"
      });

      setFormData({
        profitAmount: "",
        dividendPercentage: "",
        declarationDate: new Date().toISOString().split('T')[0],
        approvedBy: ""
      });
      setPreview(null);
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create dividend declaration",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dividend Declaration
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="profitAmount">Net Profit Amount (RWF) *</Label>
                <Input
                  id="profitAmount"
                  type="number"
                  value={formData.profitAmount}
                  onChange={(e) => setFormData({ ...formData, profitAmount: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="dividendPercentage">Dividend Percentage (%) *</Label>
                <Input
                  id="dividendPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.dividendPercentage}
                  onChange={(e) => setFormData({ ...formData, dividendPercentage: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="declarationDate">Declaration Date *</Label>
                <Input
                  id="declarationDate"
                  type="date"
                  value={formData.declarationDate}
                  onChange={(e) => setFormData({ ...formData, declarationDate: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="approvedBy">Approved By *</Label>
                <Input
                  id="approvedBy"
                  value={formData.approvedBy}
                  onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                  placeholder="Board Chairman / CEO"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCalculatePreview}
                  className="flex-1"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Preview
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={!preview}>Create Declaration</Button>
              </div>
            </form>
          </div>

          <div>
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dividend Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-600">Net Profit</div>
                      <div className="text-lg font-bold">{formatCurrency(preview.profitAmount)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Dividend %</div>
                      <div className="text-lg font-bold">{preview.dividendPercentage}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Dividend Pool</div>
                      <div className="text-lg font-bold text-green-600">{formatCurrency(preview.dividendPool)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Per Share</div>
                      <div className="text-lg font-bold">{formatCurrency(preview.perShareDividend)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Shareholder Breakdown</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {preview.distributions.map((dist: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{dist.name}</div>
                            <div className="text-sm text-gray-600">{dist.shares}% shares</div>
                          </div>
                          <div className="font-bold text-green-600">
                            {formatCurrency(dist.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
