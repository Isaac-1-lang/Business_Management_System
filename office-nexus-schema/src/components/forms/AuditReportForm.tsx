
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, FileText, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AuditReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

interface AuditReportFormData {
  title: string;
  auditType: string;
  auditor: string;
  auditedPeriod: string;
  reportDate: string;
  status: string;
  findings: number;
  description: string;
  recommendations: string;
}

export default function AuditReportForm({ open, onOpenChange, onSubmit, editData }: AuditReportFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<AuditReportFormData>({
    defaultValues: editData || {
      title: '',
      auditType: '',
      auditor: '',
      auditedPeriod: '',
      reportDate: '',
      status: 'Scheduled',
      findings: 0,
      description: '',
      recommendations: ''
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: AuditReportFormData) => {
    const formData = {
      ...data,
      findings: Number(data.findings),
      attachments: uploadedFiles
    };
    onSubmit(formData);
    reset();
    setUploadedFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {editData ? 'Edit Audit Report' : 'Add New Audit Report'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Report title is required" })}
                placeholder="e.g., Financial Audit Q4 2023"
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditType">Audit Type *</Label>
              <Select onValueChange={(value) => setValue("auditType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="IT">IT Systems</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                </SelectContent>
              </Select>
              {errors.auditType && <p className="text-sm text-red-600">{errors.auditType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditor">Auditor/Firm *</Label>
              <Input
                id="auditor"
                {...register("auditor", { required: "Auditor name is required" })}
                placeholder="e.g., PwC Rwanda, Internal Audit Team"
              />
              {errors.auditor && <p className="text-sm text-red-600">{errors.auditor.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditedPeriod">Audited Period *</Label>
              <Input
                id="auditedPeriod"
                {...register("auditedPeriod", { required: "Audited period is required" })}
                placeholder="e.g., Jan-Mar 2024"
              />
              {errors.auditedPeriod && <p className="text-sm text-red-600">{errors.auditedPeriod.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                id="reportDate"
                type="date"
                {...register("reportDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="findings">Number of Findings</Label>
              <Input
                id="findings"
                type="number"
                min="0"
                {...register("findings")}
                placeholder="0"
              />
            </div>
          </div>

          {/* Description and Recommendations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Audit Description</Label>
              <textarea
                id="description"
                {...register("description")}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the audit scope and objectives..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Key Recommendations</Label>
              <textarea
                id="recommendations"
                {...register("recommendations")}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Summary of key recommendations and action items..."
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Attach Audit Report</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">PDF, DOC, XLS up to 10MB each</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files:</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editData ? 'Update Report' : 'Add Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
