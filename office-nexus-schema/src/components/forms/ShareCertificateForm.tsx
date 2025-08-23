
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ShareCertificateFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (record: any) => void;
}

export function ShareCertificateForm({ open, onClose, onAdd }: ShareCertificateFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    certificateNo: "",
    holder: "",
    shares: "",
    date: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      certificateNo: formData.certificateNo,
      holder: formData.holder,
      shares: parseInt(formData.shares),
      date: formData.date
    };
    
    onAdd(newRecord);
    toast({
      title: "Success",
      description: "Share certificate added successfully"
    });
    
    setFormData({ certificateNo: "", holder: "", shares: "", date: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Share Certificate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="certificateNo">Certificate Number *</Label>
            <Input
              id="certificateNo"
              value={formData.certificateNo}
              onChange={(e) => setFormData({ ...formData, certificateNo: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="holder">Shareholder Name *</Label>
            <Input
              id="holder"
              value={formData.holder}
              onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="shares">Number of Shares *</Label>
            <Input
              id="shares"
              type="number"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Issue Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Certificate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
