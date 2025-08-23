
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, DollarSign, AlertTriangle } from "lucide-react";
import CompanyCapitalService, { CompanyCapital } from "@/services/companyCapitalService";

interface CompanyCapitalFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CompanyCapital | null;
}

export function CompanyCapitalForm({ open, onClose, onSuccess, editData }: CompanyCapitalFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    authorized_shares: "",
    share_price: "",
    currency: "RWF",
    capital_type: "ordinary"
  });

  const [calculatedValues, setCalculatedValues] = useState({
    total_authorized_capital: 0,
    per_share_value: 0
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        authorized_shares: editData.authorized_shares.toString(),
        share_price: editData.share_price.toString(),
        currency: editData.currency,
        capital_type: editData.capital_type
      });
    } else {
      setFormData({
        authorized_shares: "",
        share_price: "",
        currency: "RWF",
        capital_type: "ordinary"
      });
    }
  }, [editData, open]);

  useEffect(() => {
    const shares = parseFloat(formData.authorized_shares || '0');
    const price = parseFloat(formData.share_price || '0');
    
    setCalculatedValues({
      total_authorized_capital: shares * price,
      per_share_value: price
    });
  }, [formData.authorized_shares, formData.share_price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.authorized_shares || !formData.share_price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const shares = parseFloat(formData.authorized_shares);
    const price = parseFloat(formData.share_price);

    if (shares <= 0 || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Shares and price must be positive numbers",
        variant: "destructive"
      });
      return;
    }

    try {
      const capitalData = {
        company_id: localStorage.getItem('selectedCompanyId') || 'comp-001',
        authorized_shares: shares,
        share_price: price,
        currency: formData.currency,
        capital_type: formData.capital_type as 'ordinary' | 'preference' | 'mixed'
      };

      CompanyCapitalService.initializeCompanyCapital(capitalData);
      
      toast({
        title: "Success",
        description: "Company capital structure initialized successfully"
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize capital structure",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {editData ? "Edit Capital Structure" : "Initialize Company Capital"}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            This sets up your company&apos;s authorized share capital. You can issue shares up to this limit.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorized_shares">Authorized Shares *</Label>
              <Input
                id="authorized_shares"
                type="number"
                min="1"
                value={formData.authorized_shares}
                onChange={(e) => setFormData({ ...formData, authorized_shares: e.target.value })}
                placeholder="e.g., 10000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of shares your company can issue
              </p>
            </div>

            <div>
              <Label htmlFor="share_price">Price per Share *</Label>
              <Input
                id="share_price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.share_price}
                onChange={(e) => setFormData({ ...formData, share_price: e.target.value })}
                placeholder="e.g., 1000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nominal value per share in {formData.currency}
              </p>
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
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

            <div>
              <Label htmlFor="capital_type">Capital Type *</Label>
              <Select value={formData.capital_type} onValueChange={(value) => setFormData({ ...formData, capital_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordinary">Ordinary Shares</SelectItem>
                  <SelectItem value="preference">Preference Shares</SelectItem>
                  <SelectItem value="mixed">Mixed (Ordinary + Preference)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculated Values Preview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Capital Structure Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Authorized Shares:</span>
                <span className="font-bold ml-2">{parseFloat(formData.authorized_shares || '0').toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Price per Share:</span>
                <span className="font-bold ml-2">{parseFloat(formData.share_price || '0').toLocaleString()} {formData.currency}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Total Authorized Capital:</span>
                <span className="font-bold ml-2 text-green-600">
                  {calculatedValues.total_authorized_capital.toLocaleString()} {formData.currency}
                </span>
              </div>
            </div>
          </div>

          {calculatedValues.total_authorized_capital < 100000 && formData.currency === 'RWF' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Minimum capital requirements in Rwanda may apply. Please verify with RDB regulations.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editData ? "Update Capital" : "Initialize Capital"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
