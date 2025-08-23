
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface ShareTransferFormProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (data: any) => void;
  directors: any[];
}

export function ShareTransferForm({ open, onClose, onTransfer, directors }: ShareTransferFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fromShareholder: "",
    toShareholder: "",
    sharesTransferred: "",
    transferDate: new Date().toISOString().split('T')[0],
    reason: "",
    documentUrl: ""
  });

  const [transferValidation, setTransferValidation] = useState({
    fromSharesAvailable: 0,
    isValid: true,
    errorMessage: ""
  });

  useEffect(() => {
    if (formData.fromShareholder && formData.sharesTransferred) {
      const fromPerson = directors.find(d => d.id.toString() === formData.fromShareholder);
      const sharesAvailable = fromPerson ? parseFloat(fromPerson.shares || '0') : 0;
      const sharesToTransfer = parseFloat(formData.sharesTransferred || '0');

      const isValid = sharesToTransfer > 0 && sharesToTransfer <= sharesAvailable;
      const errorMessage = sharesToTransfer > sharesAvailable 
        ? `Cannot transfer more than ${sharesAvailable} shares`
        : "";

      setTransferValidation({
        fromSharesAvailable: sharesAvailable,
        isValid,
        errorMessage
      });
    }
  }, [formData.fromShareholder, formData.sharesTransferred, directors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromShareholder || !formData.toShareholder) {
      toast({
        title: "Validation Error",
        description: "Please select both from and to shareholders",
        variant: "destructive"
      });
      return;
    }

    if (formData.fromShareholder === formData.toShareholder) {
      toast({
        title: "Validation Error",
        description: "Cannot transfer shares to the same person",
        variant: "destructive"
      });
      return;
    }

    if (!transferValidation.isValid) {
      toast({
        title: "Transfer Error",
        description: transferValidation.errorMessage,
        variant: "destructive"
      });
      return;
    }

    const transferData = {
      ...formData,
      sharesTransferred: parseFloat(formData.sharesTransferred),
      transferId: `TXN-${Date.now()}`
    };

    onTransfer(transferData);
    
    // Reset form
    setFormData({
      fromShareholder: "",
      toShareholder: "",
      sharesTransferred: "",
      transferDate: new Date().toISOString().split('T')[0],
      reason: "",
      documentUrl: ""
    });
    
    onClose();
  };

  const shareholderOptions = directors.filter(d => 
    d.role && d.role.toLowerCase().includes('shareholder') && parseFloat(d.shares || '0') > 0
  );

  const fromPerson = directors.find(d => d.id.toString() === formData.fromShareholder);
  const toPerson = directors.find(d => d.id.toString() === formData.toShareholder);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Share Transfer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromShareholder">From Shareholder *</Label>
              <Select value={formData.fromShareholder} onValueChange={(value) => setFormData({ ...formData, fromShareholder: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transferor" />
                </SelectTrigger>
                <SelectContent>
                  {shareholderOptions.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.name} ({person.shares} shares)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromPerson && (
                <p className="text-xs text-gray-500 mt-1">
                  Available: {fromPerson.shares} shares
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="toShareholder">To Shareholder *</Label>
              <Select value={formData.toShareholder} onValueChange={(value) => setFormData({ ...formData, toShareholder: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {directors.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {person.name} ({person.shares || 0} shares)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sharesTransferred">Number of Shares to Transfer *</Label>
            <Input
              id="sharesTransferred"
              type="number"
              min="1"
              max={transferValidation.fromSharesAvailable}
              value={formData.sharesTransferred}
              onChange={(e) => setFormData({ ...formData, sharesTransferred: e.target.value })}
              required
            />
            {!transferValidation.isValid && transferValidation.errorMessage && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{transferValidation.errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <Label htmlFor="transferDate">Transfer Date *</Label>
            <Input
              id="transferDate"
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason for Transfer</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Sale, gift, inheritance, etc."
            />
          </div>

          {fromPerson && toPerson && formData.sharesTransferred && transferValidation.isValid && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transfer Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{fromPerson.name} (current)</span>
                  <span>{fromPerson.shares} shares</span>
                </div>
                <div className="flex justify-between">
                  <span>{fromPerson.name} (after transfer)</span>
                  <span className="font-bold">{parseFloat(fromPerson.shares) - parseFloat(formData.sharesTransferred)} shares</span>
                </div>
                <div className="flex justify-between">
                  <span>{toPerson.name} (current)</span>
                  <span>{toPerson.shares || 0} shares</span>
                </div>
                <div className="flex justify-between">
                  <span>{toPerson.name} (after transfer)</span>
                  <span className="font-bold">{parseFloat(toPerson.shares || '0') + parseFloat(formData.sharesTransferred)} shares</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!transferValidation.isValid}>
              Execute Transfer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
