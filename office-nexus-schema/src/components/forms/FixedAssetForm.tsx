
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import FixedAssetService from "@/services/fixedAssetService";
import UniversalTransactionService from "@/services/universalTransactionService";

interface FixedAssetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FixedAssetForm({ open, onClose, onSuccess }: FixedAssetFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    acquisitionDate: '',
    acquisitionCost: '',
    depreciationMethod: 'straight_line' as const,
    usefulLifeYears: '',
    residualValue: '',
    location: '',
    supplier: '',
    status: 'active' as const,
    // UTS integration fields
    useUTS: true,
    paymentMethod: 'bank' as 'cash' | 'bank',
    includeVAT: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Computer Equipment',
    'Vehicle',
    'Furniture',
    'Machinery',
    'Building',
    'Land',
    'Office Equipment',
    'Tools'
  ];

  const locations = [
    'Main Office',
    'IT Department',
    'Administration',
    'Warehouse',
    'Production Floor',
    'Reception',
    'Conference Room'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.acquisitionDate || 
        !formData.acquisitionCost || !formData.usefulLifeYears) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const acquisitionCost = parseFloat(formData.acquisitionCost);
      const totalAmount = formData.includeVAT ? acquisitionCost * 1.18 : acquisitionCost;

      if (formData.useUTS) {
        // Use Universal Transaction System for integrated accounting
        UniversalTransactionService.createTransaction({
          type: 'asset_acquisition',
          amount: totalAmount,
          payment_method: formData.paymentMethod,
          description: `Asset Acquisition - ${formData.name}`,
          date: formData.acquisitionDate,
          supplier: formData.supplier,
          status: 'confirmed',
          company_id: localStorage.getItem('selectedCompanyId') || 'comp-001',
          asset_details: {
            name: formData.name,
            category: formData.category,
            location: formData.location,
            useful_life_years: parseInt(formData.usefulLifeYears),
            residual_value: parseFloat(formData.residualValue) || 0,
            depreciation_method: formData.depreciationMethod
          }
        });

        toast({
          title: "Success",
          description: "Asset added and accounting entries posted automatically"
        });
      } else {
        // Traditional method - just add to asset register
        const assetData = {
          name: formData.name,
          category: formData.category,
          acquisitionDate: formData.acquisitionDate,
          acquisitionCost: acquisitionCost,
          depreciationMethod: formData.depreciationMethod,
          usefulLifeYears: parseInt(formData.usefulLifeYears),
          residualValue: parseFloat(formData.residualValue) || 0,
          location: formData.location,
          supplier: formData.supplier,
          status: formData.status
        };

        FixedAssetService.addAsset(assetData);

        toast({
          title: "Success",
          description: "Fixed asset has been added successfully"
        });
      }

      // Reset form
      setFormData({
        name: '',
        category: '',
        acquisitionDate: '',
        acquisitionCost: '',
        depreciationMethod: 'straight_line',
        usefulLifeYears: '',
        residualValue: '',
        location: '',
        supplier: '',
        status: 'active',
        useUTS: true,
        paymentMethod: 'bank',
        includeVAT: true
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fixed asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Fixed Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UTS Integration Section */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useUTS"
                checked={formData.useUTS}
                onCheckedChange={(checked) => handleInputChange('useUTS', checked as boolean)}
              />
              <Label htmlFor="useUTS" className="text-sm font-medium">
                Use Universal Transaction System (Recommended)
              </Label>
            </div>
            <p className="text-xs text-blue-700">
              Automatically posts journal entries, updates ledger, and maintains full audit trail
            </p>
            
            {formData.useUTS && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="includeVAT"
                    checked={formData.includeVAT}
                    onCheckedChange={(checked) => handleInputChange('includeVAT', checked as boolean)}
                  />
                  <Label htmlFor="includeVAT" className="text-sm">Include VAT (18%)</Label>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Dell Laptop - IT001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionCost">
                {formData.useUTS && formData.includeVAT ? 'Net Cost (RWF) *' : 'Acquisition Cost (RWF) *'}
              </Label>
              <Input
                id="acquisitionCost"
                type="number"
                value={formData.acquisitionCost}
                onChange={(e) => handleInputChange('acquisitionCost', e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                required
              />
              {formData.useUTS && formData.includeVAT && formData.acquisitionCost && (
                <p className="text-xs text-gray-600">
                  Total with VAT: {FixedAssetService.formatCurrency(parseFloat(formData.acquisitionCost) * 1.18)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usefulLifeYears">Useful Life (Years) *</Label>
              <Input
                id="usefulLifeYears"
                type="number"
                value={formData.usefulLifeYears}
                onChange={(e) => handleInputChange('usefulLifeYears', e.target.value)}
                placeholder="5"
                min="1"
                max="50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residualValue">Residual Value (RWF)</Label>
              <Input
                id="residualValue"
                type="number"
                value={formData.residualValue}
                onChange={(e) => handleInputChange('residualValue', e.target.value)}
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="e.g. Dell Rwanda"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depreciationMethod">Depreciation Method</Label>
            <Select 
              value={formData.depreciationMethod} 
              onValueChange={(value) => handleInputChange('depreciationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight_line">Straight Line</SelectItem>
                <SelectItem value="reducing_balance" disabled>Reducing Balance (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
