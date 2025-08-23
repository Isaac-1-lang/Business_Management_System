
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BeneficialOwnerFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (record: any) => void;
}

export function BeneficialOwnerForm({ open, onClose, onAdd }: BeneficialOwnerFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    ownership: "",
    nationality: "",
    address: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      name: formData.name,
      nationalId: formData.nationalId,
      ownership: formData.ownership,
      nationality: formData.nationality,
      address: formData.address
    };
    
    onAdd(newRecord);
    toast({
      title: "Success",
      description: "Beneficial owner added successfully"
    });
    
    setFormData({ name: "", nationalId: "", ownership: "", nationality: "", address: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Beneficial Owner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Label htmlFor="ownership">Ownership % *</Label>
            <Input
              id="ownership"
              type="number"
              min="0"
              max="100"
              value={formData.ownership}
              onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
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
                <SelectItem value="rwandan">Rwandan</SelectItem>
                <SelectItem value="kenyan">Kenyan</SelectItem>
                <SelectItem value="ugandan">Ugandan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Owner</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
