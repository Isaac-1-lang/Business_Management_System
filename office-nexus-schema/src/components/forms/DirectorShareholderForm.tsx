import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DirectorShareholderFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  editData?: any;
  currentDirectors?: any[];
  authorizedShares?: number;
}

export function DirectorShareholderForm({ 
  open, 
  onClose, 
  onAdd, 
  editData, 
  currentDirectors = [],
  authorizedShares = 10000 
}: DirectorShareholderFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    nationalId: "",
    role: "",
    ownershipPercent: "",
    nationality: "",
    document: null as File | null
  });

  const [shareValidation, setShareValidation] = useState({
    currentTotal: 0,
    newTotal: 0,
    isValid: true,
    availableShares: 0
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        fullName: editData.name || "",
        nationalId: editData.nationalId || "",
        role: editData.role || "",
        ownershipPercent: editData.shares || "",
        nationality: editData.nationality || "",
        document: editData.document || null
      });
    } else {
      setFormData({
        fullName: "",
        nationalId: "",
        role: "",
        ownershipPercent: "",
        nationality: "",
        document: null
      });
    }
  }, [editData, open]);

  useEffect(() => {
    // Calculate current total shares (excluding the one being edited)
    const currentTotal = currentDirectors
      .filter(d => !editData || d.id !== editData.id)
      .reduce((sum, d) => sum + parseFloat(d.shares || '0'), 0);
    
    const newShares = parseFloat(formData.ownershipPercent || '0');
    const newTotal = currentTotal + newShares;
    const availableShares = authorizedShares - currentTotal;
    
    setShareValidation({
      currentTotal,
      newTotal,
      isValid: newTotal <= authorizedShares,
      availableShares
    });
  }, [formData.ownershipPercent, currentDirectors, editData, authorizedShares]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nationalId.trim()) {
      toast({
        title: "Validation Error",
        description: "National ID/Passport is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Validation Error",
        description: "Role is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ownershipPercent || parseFloat(formData.ownershipPercent) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid ownership percentage is required",
        variant: "destructive"
      });
      return;
    }

    if (!shareValidation.isValid) {
      toast({
        title: "Share Allocation Error",
        description: `Total shares would exceed authorized limit of ${authorizedShares.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.nationality) {
      toast({
        title: "Validation Error",
        description: "Nationality is required",
        variant: "destructive"
      });
      return;
    }

    console.log("Director/Shareholder data:", formData);
    onAdd(formData);
    
    // Reset form
    setFormData({
      fullName: "",
      nationalId: "",
      role: "",
      ownershipPercent: "",
      nationality: "",
      document: null
    });
    
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      nationalId: "",
      role: "",
      ownershipPercent: "",
      nationality: "",
      document: null
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Director/Shareholder" : "Add Director/Shareholder"}
          </DialogTitle>
        </DialogHeader>

        {/* Share Allocation Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-2">Share Allocation Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Authorized Shares:</span>
              <span className="font-bold ml-2">{authorizedShares.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Currently Allocated:</span>
              <span className="font-bold ml-2">{shareValidation.currentTotal.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Available Shares:</span>
              <span className="font-bold ml-2 text-green-600">{shareValidation.availableShares.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">New Total (if saved):</span>
              <span className={`font-bold ml-2 ${shareValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {shareValidation.newTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {!shareValidation.isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This allocation would exceed the authorized share limit. Maximum available: {shareValidation.availableShares.toLocaleString()} shares
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nationalId">National ID/Passport *</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Shareholder">Shareholder</SelectItem>
                  <SelectItem value="Director & Shareholder">Director & Shareholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ownershipPercent">Number of Shares *</Label>
              <Input
                id="ownershipPercent"
                type="number"
                min="0"
                max={shareValidation.availableShares + (editData ? parseFloat(editData.shares || '0') : 0)}
                value={formData.ownershipPercent}
                onChange={(e) => setFormData({ ...formData, ownershipPercent: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Max available: {(shareValidation.availableShares + (editData ? parseFloat(editData.shares || '0') : 0)).toLocaleString()}
              </p>
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
          </div>
          <div>
            <Label htmlFor="document">Contract/Share Certificate</Label>
            <Input
              id="document"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {formData.document && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {formData.document.name}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!shareValidation.isValid}>
              {editData ? "Update Person" : "Add Person"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
