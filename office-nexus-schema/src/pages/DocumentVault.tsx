import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Search,
  Folder,
  Shield,
  Clock,
} from "lucide-react";
import { DocumentUploadForm } from "@/components/forms/DocumentUploadForm";
import AuditLogService from "@/services/auditLogService";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { ExportButton } from "@/components/common/ExportButton";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_CATEGORIES = [
  { value: "rdb-registration", label: "RDB Registration" },
  { value: "trading-licenses", label: "Trading Licenses" },
  { value: "tax-filing", label: "Tax Filing" },
  { value: "hr-contracts", label: "HR/Staff Contracts" },
  { value: "contracts-agreements", label: "Contracts & Agreements" },
  { value: "assets-insurance", label: "Assets & Insurance" },
  { value: "internal-docs", label: "Internal Documents" },
];

export default function DocumentVault() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data.documents || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentData: any) => {
    try {
      const response = await apiService.createDocument(documentData);
      if (response.success && response.data) {
        // Log the upload action
        AuditLogService.logAction({
          action_type: 'create',
          table_name: 'documents',
          record_id: response.data.document.id.toString(),
          description: `Document uploaded: ${response.data.document.title}`,
          new_data: response.data.document
        });

        toast({
          title: "Success",
          description: "Document uploaded successfully"
        });

        await loadDocuments();
        setShowUploadForm(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload document",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    try {
      const response = await apiService.deleteDocument(id);
      if (response.success) {
        // Log the deletion
        AuditLogService.logAction({
          action_type: 'delete',
          table_name: 'documents',
          record_id: id.toString(),
          description: `Document deleted: ${document.title}`,
          old_data: document
        });

        toast({
          title: "Success",
          description: "Document deleted successfully"
        });

        await loadDocuments();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete document",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const getFilteredDocuments = () => {
    let filtered = [...documents];

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadedAt);
        if (dateRange.from && docDate < dateRange.from) return false;
        if (dateRange.to && docDate > dateRange.to) return false;
        return true;
      });
    }

    return filtered;
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    setDateRange({ from, to });
  };

  const exportColumns = [
    { key: 'title', label: 'Document Title' },
    { key: 'category', label: 'Category' },
    { key: 'uploadedBy', label: 'Uploaded By' },
    { key: 'uploadedAt', label: 'Upload Date' },
    { key: 'type', label: 'File Type' }
  ];

  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Document Vault
              </h1>
              <p className="text-gray-600 mt-2">
                Secure storage for all your business documents with compliance tracking
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton
                data={filteredDocuments}
                filename="document-vault-export"
                title="Document Vault Export"
                columns={exportColumns}
              />
              <Button onClick={() => setShowUploadForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Set(documents.map(doc => doc.category)).size}
                    </p>
                  </div>
                  <Folder className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Secured Docs</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {documents.filter(doc => doc.secured).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {documents.filter(doc => {
                        const docDate = new Date(doc.uploadedAt);
                        const thisMonth = new Date();
                        return docDate.getMonth() === thisMonth.getMonth() && 
                               docDate.getFullYear() === thisMonth.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1">
                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {document.title}
                    </div>
                    {document.description && (
                      <div className="text-sm text-gray-500">
                        {document.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{document.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {document.uploadedBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {document.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload Form Dialog */}
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <DocumentUploadForm 
              onClose={() => setShowUploadForm(false)}
              onUpload={handleDocumentUpload}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
