
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import AccountingService from "@/services/accountingService";

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (invoice: any) => void;
}

export function InvoiceForm({ open, onClose, onAdd }: InvoiceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    client: "",
    amount: "",
    date: "",
    dueDate: "",
    description: "",
    vatIncluded: true,
    recordInAccounting: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceId = `INV-${Date.now()}`;
    const amount = parseFloat(formData.amount);
    
    // Create invoice record
    const newInvoice = {
      id: invoiceId,
      number: formData.invoiceNumber,
      client: formData.client,
      amount: amount,
      date: formData.date,
      dueDate: formData.dueDate,
      description: formData.description,
      status: "Pending",
      vatIncluded: formData.vatIncluded
    };
    
    // Record in accounting system
    if (formData.recordInAccounting) {
      try {
        AccountingService.recordSalesInvoice({
          id: invoiceId,
          number: formData.invoiceNumber,
          client: formData.client,
          amount: amount,
          date: formData.date,
          vatRate: formData.vatIncluded ? 0.18 : 0
        });
        
        console.log("Invoice recorded in accounting system");
      } catch (error) {
        console.error("Error recording in accounting:", error);
        toast({
          title: "Warning",
          description: "Invoice created but accounting entry failed. Please check the general ledger.",
          variant: "destructive"
        });
      }
    }
    
    onAdd(newInvoice);
    toast({
      title: "Success",
      description: `Invoice ${formData.invoiceNumber} created successfully`
    });
    
    // Reset form
    setFormData({
      invoiceNumber: "",
      client: "",
      amount: "",
      date: "",
      dueDate: "",
      description: "",
      vatIncluded: true,
      recordInAccounting: true
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2024-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="client">Client *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (RWF) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Invoice Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Invoice description or items"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vatIncluded"
                checked={formData.vatIncluded}
                onCheckedChange={(checked) => setFormData({ ...formData, vatIncluded: !!checked })}
              />
              <Label htmlFor="vatIncluded">Amount includes 18% VAT</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recordInAccounting"
                checked={formData.recordInAccounting}
                onCheckedChange={(checked) => setFormData({ ...formData, recordInAccounting: !!checked })}
              />
              <Label htmlFor="recordInAccounting">Record in accounting system (recommended)</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
