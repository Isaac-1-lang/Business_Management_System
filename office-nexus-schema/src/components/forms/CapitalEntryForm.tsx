
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PiggyBank, Upload } from "lucide-react";
import UniversalTransactionHandler from "@/services/universalTransactionHandler";

interface CapitalEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CapitalEntryForm({ open, onClose, onSuccess }: CapitalEntryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    shareholder_name: '',
    shareholder_id: '',
    amount: '',
    date_contributed: '',
    method: '',
    type: 'contribution',
    description: '',
    file_url: '',
    status: 'confirmed',
    shares_allocated: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shareholder_name || !formData.amount || !formData.date_contributed || !formData.method) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Map form type to UTS transaction type
      const transactionType = formData.type === 'contribution' ? 'capital_contribution' : 
                             formData.type === 'withdrawal' ? 'capital_withdrawal' : 'equity_adjustment';

      // Process through Universal Transaction Handler
      const response = await UniversalTransactionHandler.processTransaction({
        type: transactionType as any,
        amount: parseFloat(formData.amount),
        description: formData.description || `Capital ${formData.type} by ${formData.shareholder_name}`,
        date: formData.date_contributed,
        payment_method: formData.method === 'cash' ? 'cash' : 'bank',
        payment_status: 'paid', // Capital transactions are immediate
        reference_number: `CAP-${Date.now()}`,
        supporting_documents: formData.file_url ? [formData.file_url] : [],
        additional_data: {
          shareholder_id: formData.shareholder_id || `SH-${Date.now()}`,
          shareholder_name: formData.shareholder_name,
          shares_allocated: parseFloat(formData.shares_allocated || '0'),
          transaction_type: formData.type,
          status: formData.status
        }
      });

      if (response.success) {
        toast({
          title: "Capital Entry Processed",
          description: `Capital ${formData.type} recorded and posted to accounting books automatically`,
        });

        onSuccess();
        onClose();
        setFormData({
          shareholder_name: '',
          shareholder_id: '',
          amount: '',
          date_contributed: '',
          method: '',
          type: 'contribution',
          description: '',
          file_url: '',
          status: 'confirmed',
          shares_allocated: ''
        });
      } else {
        toast({
          title: "Error",
          description: response.errors?.join(', ') || "Failed to process capital entry",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record capital entry",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Record Capital Entry (Integrated UTS)
          </DialogTitle>
          <p className="text-sm text-gray-600">
            This will automatically post to accounting books and update all related registers
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shareholder_name">Shareholder Name *</Label>
              <Input
                id="shareholder_name"
                value={formData.shareholder_name}
                onChange={(e) => setFormData({...formData, shareholder_name: e.target.value})}
                placeholder="Enter shareholder name"
              />
            </div>
            <div>
              <Label htmlFor="type">Entry Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contribution">💰 Capital Contribution</SelectItem>
                  <SelectItem value="withdrawal">💸 Capital Withdrawal</SelectItem>
                  <SelectItem value="adjustment">⚖️ Capital Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (RWF) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <Label htmlFor="shares_allocated">Shares Allocated</Label>
              <Input
                id="shares_allocated"
                type="number"
                value={formData.shares_allocated}
                onChange={(e) => setFormData({...formData, shares_allocated: e.target.value})}
                placeholder="Number of shares (optional)"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_contributed">Date *</Label>
              <Input
                id="date_contributed"
                type="date"
                value={formData.date_contributed}
                onChange={(e) => setFormData({...formData, date_contributed: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Cash</SelectItem>
                  <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="asset_in_kind">🏠 Asset in Kind</SelectItem>
                  <SelectItem value="other">📋 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional details about this capital entry..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="file_url">Supporting Document URL</Label>
            <div className="flex gap-2">
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                placeholder="URL to bank slip, agreement, or receipt"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Transaction Preview */}
          {formData.amount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📊 Accounting Preview</h4>
              <div className="text-sm space-y-1">
                {formData.type === 'contribution' && (
                  <>
                    <div className="flex justify-between">
                      <span>Dr: {formData.method === 'cash' ? 'Petty Cash' : 'Cash at Bank'}</span>
                      <span className="font-mono">RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cr: Share Capital</span>
                      <span className="font-mono">RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                  </>
                )}
                {formData.type === 'withdrawal' && (
                  <>
                    <div className="flex justify-between">
                      <span>Dr: Owner Drawings</span>
                      <span className="font-mono">RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cr: {formData.method === 'cash' ? 'Petty Cash' : 'Cash at Bank'}</span>
                      <span className="font-mono">RWF {parseFloat(formData.amount || '0').toLocaleString()}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-blue-700 mt-2">
                  ✅ This will automatically update: General Ledger, Cash Book, Capital Register, and Shareholder Records
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Record & Post Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
