
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContractFormProps {
  open: boolean;
  onClose: () => void;
  onAdd: (contract: any) => void;
}

export function ContractForm({ open, onClose, onAdd }: ContractFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    contractTitle: "",
    partiesInvolved: "",
    type: "",
    startDate: "",
    endDate: "",
    status: "",
    value: "",
    file: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contract data:", formData);
    
    const newContract = {
      id: Date.now(),
      title: formData.contractTitle,
      type: formData.type,
      parties: formData.partiesInvolved,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      value: parseInt(formData.value) || 0
    };
    
    onAdd(newContract);
    toast({
      title: "Success",
      description: "Contract added successfully"
    });
    
    setFormData({
      contractTitle: "",
      partiesInvolved: "",
      type: "",
      startDate: "",
      endDate: "",
      status: "",
      value: "",
      file: null
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractTitle">Contract Title *</Label>
              <Input
                id="contractTitle"
                value={formData.contractTitle}
                onChange={(e) => setFormData({ ...formData, contractTitle: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lease">Lease</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Contract Value (RWF)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="partiesInvolved">Parties Involved *</Label>
            <Textarea
              id="partiesInvolved"
              value={formData.partiesInvolved}
              onChange={(e) => setFormData({ ...formData, partiesInvolved: e.target.value })}
              placeholder="e.g., ABC Company Ltd & Our Company"
              required
            />
          </div>
          <div>
            <Label htmlFor="file">Contract Document</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Contract</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
