
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCheck, AlertTriangle, Shield } from "lucide-react";
import BeneficialOwnerService, { BeneficialOwner } from "@/services/beneficialOwnerService";

interface EnhancedBeneficialOwnerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: BeneficialOwner | null;
}

export function EnhancedBeneficialOwnerForm({ open, onClose, onSuccess, editData }: EnhancedBeneficialOwnerFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    nationality: "",
    id_number: "",
    date_of_birth: "",
    relationship_to_company: "direct_owner",
    ownership_percentage: "",
    control_percentage: "",
    has_significant_control: false,
    control_nature: [] as string[],
    address: "",
    contact_info: "",
    verification_status: "pending"
  });

  const [ownershipValidation, setOwnershipValidation] = useState({
    isValid: true,
    message: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        full_name: editData.full_name,
        nationality: editData.nationality,
        id_number: editData.id_number,
        date_of_birth: editData.date_of_birth || "",
        relationship_to_company: editData.relationship_to_company,
        ownership_percentage: editData.ownership_percentage.toString(),
        control_percentage: editData.control_percentage.toString(),
        has_significant_control: editData.has_significant_control,
        control_nature: editData.control_nature,
        address: editData.address,
        contact_info: editData.contact_info || "",
        verification_status: editData.verification_status
      });
    } else {
      setFormData({
        full_name: "",
        nationality: "",
        id_number: "",
        date_of_birth: "",
        relationship_to_company: "direct_owner",
        ownership_percentage: "",
        control_percentage: "",
        has_significant_control: false,
        control_nature: [],
        address: "",
        contact_info: "",
        verification_status: "pending"
      });
    }
  }, [editData, open]);

  useEffect(() => {
    const ownershipPercent = parseFloat(formData.ownership_percentage || '0');
    const controlPercent = parseFloat(formData.control_percentage || '0');
    
    // Validate ownership percentages
    const validation = BeneficialOwnerService.validateOwnershipPercentages();
    const currentTotal = validation.totalPercentage + (editData ? -editData.ownership_percentage : 0) + ownershipPercent;
    
    if (currentTotal > 100) {
      setOwnershipValidation({
        isValid: false,
        message: `Total beneficial ownership would exceed 100% (${currentTotal.toFixed(1)}%)`
      });
    } else if (ownershipPercent >= 25 || controlPercent >= 25) {
      setFormData(prev => ({ ...prev, has_significant_control: true }));
      setOwnershipValidation({
        isValid: true,
        message: "Significant control detected (25%+ ownership/control)"
      });
    } else {
      setOwnershipValidation({
        isValid: true,
        message: ""
      });
    }
  }, [formData.ownership_percentage, formData.control_percentage, editData]);

  const handleControlNatureChange = (nature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        control_nature: [...prev.control_nature, nature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        control_nature: prev.control_nature.filter(n => n !== nature)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.nationality || !formData.id_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!ownershipValidation.isValid) {
      toast({
        title: "Ownership Error",
        description: ownershipValidation.message,
        variant: "destructive"
      });
      return;
    }

    try {
      const beneficialOwnerData = {
        full_name: formData.full_name,
        nationality: formData.nationality,
        id_number: formData.id_number,
        date_of_birth: formData.date_of_birth,
        relationship_to_company: formData.relationship_to_company as BeneficialOwner['relationship_to_company'],
        ownership_percentage: parseFloat(formData.ownership_percentage || '0'),
        control_percentage: parseFloat(formData.control_percentage || '0'),
        has_significant_control: formData.has_significant_control,
        control_nature: formData.control_nature,
        linked_shareholder_ids: [],
        address: formData.address,
        contact_info: formData.contact_info,
        document_urls: [],
        verification_status: formData.verification_status as BeneficialOwner['verification_status']
      };

      if (editData) {
        BeneficialOwnerService.updateBeneficialOwner(editData.id, beneficialOwnerData);
        toast({
          title: "Success",
          description: "Beneficial owner updated successfully"
        });
      } else {
        BeneficialOwnerService.addBeneficialOwner(beneficialOwnerData);
        toast({
          title: "Success",
          description: "Beneficial owner added successfully"
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save beneficial owner",
        variant: "destructive"
      });
    }
  };

  const controlNatureOptions = [
    "Holds shares directly",
    "Controls voting rights",
    "Appoints/removes directors",
    "Significant influence over management",
    "Ultimate beneficial owner",
    "Trustee/nominee arrangement"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            {editData ? "Edit Beneficial Owner" : "Add Beneficial Owner"}
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Beneficial owners are the natural persons who ultimately own or control the company. 
            Anyone with 25%+ ownership or control is considered to have significant control.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="id_number">National ID/Passport *</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <Select value={formData.nationality} onValueChange={(value) => setFormData({ ...formData, nationality: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rwandan">Rwandan</SelectItem>
                  <SelectItem value="Kenyan">Kenyan</SelectItem>
                  <SelectItem value="Ugandan">Ugandan</SelectItem>
                  <SelectItem value="Tanzanian">Tanzanian</SelectItem>
                  <SelectItem value="Burundian">Burundian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="ownership_percentage">Ownership Percentage *</Label>
              <Input
                id="ownership_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.ownership_percentage}
                onChange={(e) => setFormData({ ...formData, ownership_percentage: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="control_percentage">Control Percentage</Label>
              <Input
                id="control_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.control_percentage}
                onChange={(e) => setFormData({ ...formData, control_percentage: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="relationship_to_company">Relationship to Company *</Label>
            <Select value={formData.relationship_to_company} onValueChange={(value) => setFormData({ ...formData, relationship_to_company: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct_owner">Direct Owner</SelectItem>
                <SelectItem value="indirect_owner">Indirect Owner</SelectItem>
                <SelectItem value="ultimate_controller">Ultimate Controller</SelectItem>
                <SelectItem value="nominee_beneficiary">Nominee Beneficiary</SelectItem>
                <SelectItem value="trustee">Trustee</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nature of Control</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {controlNatureOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.control_nature.includes(option)}
                    onCheckedChange={(checked) => handleControlNatureChange(option, checked as boolean)}
                  />
                  <Label htmlFor={option} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_info">Contact Information</Label>
            <Input
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              placeholder="Phone, email, etc."
            />
          </div>

          {!ownershipValidation.isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{ownershipValidation.message}</AlertDescription>
            </Alert>
          )}

          {ownershipValidation.message && ownershipValidation.isValid && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>{ownershipValidation.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!ownershipValidation.isValid}>
              {editData ? "Update Owner" : "Add Owner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
