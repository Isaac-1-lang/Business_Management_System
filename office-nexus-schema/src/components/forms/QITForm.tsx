
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Receipt, Calendar, DollarSign } from "lucide-react";
import TaxService, { QITReturn } from "@/services/taxService";

interface QITFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingQIT?: QITReturn | null;
}

export function QITForm({ open, onClose, onSuccess, editingQIT }: QITFormProps) {
  const { toast } = useToast();
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [estimatedIncome, setEstimatedIncome] = useState('');
  const [taxRate] = useState(30); // Fixed at 30% for QIT
  const [paid, setPaid] = useState(false);
  const [paidDate, setPaidDate] = useState('');
  const [rraProofFile, setRraProofFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingQITs, setExistingQITs] = useState<QITReturn[]>([]);

  const calculatedTaxAmount = (parseFloat(estimatedIncome) || 0) * (taxRate / 100);

  useEffect(() => {
    if (open) {
      if (editingQIT) {
        setQuarter(editingQIT.quarter);
        setYear(editingQIT.year);
        setEstimatedIncome(editingQIT.estimated_income.toString());
        setPaid(editingQIT.paid);
        setPaidDate(editingQIT.paid_date || '');
        setRraProofFile(editingQIT.rra_proof_file || '');
      } else {
        // Set current quarter as default
        const currentQuarter = TaxService.getCurrentQuarter();
        setQuarter(currentQuarter);
        resetForm();
      }
      
      // Load existing QITs for the year
      setExistingQITs(TaxService.getQITPayments(year));
    }
  }, [open, editingQIT, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estimatedIncome || parseFloat(estimatedIncome) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid estimated income",
        variant: "destructive"
      });
      return;
    }

    if (paid && !paidDate) {
      toast({
        title: "Validation Error",
        description: "Please enter the payment date",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const qitData = {
        quarter,
        year,
        estimated_income: parseFloat(estimatedIncome),
        tax_rate: taxRate,
        paid,
        paid_date: paid ? paidDate : undefined,
        rra_proof_file: rraProofFile || undefined
      };

      const savedQIT = TaxService.recordQITPayment(qitData);

      toast({
        title: "QIT Record Saved",
        description: `Quarterly Income Tax for ${quarter} ${year} has been recorded successfully`
      });

      onSuccess();
      onClose();
      resetForm();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save QIT record",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuarter(TaxService.getCurrentQuarter());
    setYear(new Date().getFullYear().toString());
    setEstimatedIncome('');
    setPaid(false);
    setPaidDate('');
    setRraProofFile('');
  };

  const handlePaidChange = (checked: boolean | "indeterminate") => {
    setPaid(checked === true);
    if (!checked) {
      setPaidDate('');
      setRraProofFile('');
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    setExistingQITs(TaxService.getQITPayments(newYear));
  };

  const getDueDate = () => {
    const quarterDates = {
      'Q1': `${year}-03-31`,
      'Q2': `${year}-06-30`,
      'Q3': `${year}-09-30`,
      'Q4': `${year}-12-31`
    };
    return quarterDates[quarter as keyof typeof quarterDates];
  };

  const isOverdue = () => {
    const dueDate = new Date(getDueDate());
    return new Date() > dueDate && !paid;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {editingQIT ? 'Edit QIT Record' : 'Record QIT Payment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Year Overview */}
          {existingQITs.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {year} QIT Overview
                </h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                    const qitRecord = existingQITs.find(qit => qit.quarter === q);
                    return (
                      <div key={q} className={`p-2 rounded text-center ${
                        qitRecord?.paid ? 'bg-green-100 text-green-800' : 
                        qitRecord ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <div className="font-medium">{q}</div>
                        <div className="text-xs">
                          {qitRecord ? (qitRecord.paid ? 'Paid' : 'Pending') : 'Not Set'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                min="2020"
                max={new Date().getFullYear().toString()}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedIncome">Estimated Income (RWF)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="estimatedIncome"
                type="number"
                value={estimatedIncome}
                onChange={(e) => setEstimatedIncome(e.target.value)}
                placeholder="Enter estimated quarterly income"
                className="pl-10"
                min="0"
                step="1000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your estimated income for {quarter} {year}
            </p>
          </div>

          {/* Tax Calculation Display */}
          <Card className={`${isOverdue() ? 'border-red-200 bg-red-50' : 'bg-gray-50'}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax Rate:</span>
                  <span className="font-medium">{taxRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium">{getDueDate()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-gray-600">Calculated Tax Amount:</span>
                  <span className="font-bold text-lg text-blue-600">
                    RWF {calculatedTaxAmount.toLocaleString()}
                  </span>
                </div>
                {isOverdue() && (
                  <div className="text-red-600 text-sm font-medium">
                    ⚠️ This payment is overdue
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="paid"
              checked={paid}
              onCheckedChange={handlePaidChange}
            />
            <Label htmlFor="paid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark as paid
            </Label>
          </div>

          {paid && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <Label htmlFor="paidDate">Payment Date</Label>
                <Input
                  id="paidDate"
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required={paid}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="rraProofFile">RRA Receipt Reference</Label>
                <Input
                  id="rraProofFile"
                  type="text"
                  value={rraProofFile}
                  onChange={(e) => setRraProofFile(e.target.value)}
                  placeholder="e.g., qit_q1_2024_receipt.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Reference number or file name for the RRA payment receipt
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Receipt className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save QIT Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
