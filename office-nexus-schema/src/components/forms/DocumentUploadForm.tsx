
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_CATEGORIES = [
  { value: "rdb-registration", label: "RDB Registration" },
  { value: "trading-licenses", label: "Trading Licenses" },
  { value: "tax-filing", label: "Tax Filing" },
  { value: "hr-contracts", label: "HR/Staff Contracts" },
  { value: "contracts-agreements", label: "Contracts & Agreements" },
  { value: "assets-insurance", label: "Assets & Insurance" },
  { value: "internal-docs", label: "Internal Documents" }
];

const ACCESS_ROLES = [
  { value: "admin", label: "Admin Only" },
  { value: "finance", label: "Finance Team" },
  { value: "hr", label: "HR Team" },
  { value: "legal", label: "Legal Team" },
  { value: "all", label: "All Users" }
];

interface DocumentUploadFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function DocumentUploadForm({ onClose, onSuccess }: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    dateIssued: "",
    accessRole: "",
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, file: null });
    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.file) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new document entry
      const newDocument = {
        id: Date.now(),
        title: formData.title,
        category: formData.category,
        description: formData.description,
        dateIssued: formData.dateIssued,
        accessRole: formData.accessRole || "all",
        fileName: formData.file.name,
        fileSize: formData.file.size,
        uploadedBy: "Current User",
        uploadedAt: new Date().toISOString(),
        secured: formData.accessRole !== "all",
        type: getDocumentType(formData.file.name)
      };

      // Store in localStorage
      const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      existingDocs.push(newDocument);
      localStorage.setItem('documents', JSON.stringify(existingDocs));

      toast({
        title: "Document Uploaded",
        description: `${formData.title} has been successfully uploaded to the vault.`
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        description: "",
        dateIssued: "",
        accessRole: "",
        file: null
      });

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getDocumentType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Spreadsheet';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'Image';
      default: return 'Document';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5" />
          Upload Document
        </h2>
        <p className="text-sm text-gray-600">
          Add a new document to the secure vault with proper categorization and access controls.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter document title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateIssued">Date Issued</Label>
            <Input
              id="dateIssued"
              type="date"
              value={formData.dateIssued}
              onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessRole">Access Level</Label>
            <Select value={formData.accessRole} onValueChange={(value) => setFormData({ ...formData, accessRole: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Who can access?" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description or notes about this document"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label>File Upload *</Label>
          {!formData.file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm font-medium">Click to upload a file</p>
                  <p className="text-xs text-gray-500">PDF, DOC, XLS, or image files up to 10MB</p>
                </div>
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{formData.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(formData.file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isUploading} className="flex-1">
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
