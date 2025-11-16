
import { ArrowLeft, Upload, Edit, Save, Building2, FileText, Download, Trash2, Users, Settings, Globe, Phone, Mail, MapPin, Calendar, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfileForm } from "@/components/forms/CompanyProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, Company as ApiCompany } from "@/services/apiService";

// Extended company data for profile management
type CompanyProfileData = ApiCompany & {
  sector?: string;
  incorporation_date?: string;
}

export default function CompanyProfile() {
  const { toast } = useToast();
  const { selectedCompany, companies } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyProfileData | null>(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    loadCompanyData();
  }, [selectedCompany]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // First try to get from AuthContext
      if (selectedCompany) {
        // Fetch full company details from API
        const companyId = String(selectedCompany.id);
        const response = await apiService.getCompany(companyId);
        
        if (response.success && response.data) {
          // Map API company to CompanyProfileData format
          const apiCompany = response.data;
          setCompanyData({
            ...apiCompany,
            sector: apiCompany.industry || '',
            size: apiCompany.size || '',
            incorporation_date: apiCompany.createdAt || '',
          });
        } else {
          // Fallback to selectedCompany from context
          setCompanyData({
            id: String(selectedCompany.id),
            name: selectedCompany.name || '',
            tin: selectedCompany.tin || '',
            vatNumber: '',
            rdbRegistration: '',
            address: {
              street: '',
              city: '',
              district: '',
              sector: '',
              cell: '',
            },
            phone: '',
            email: '',
            industry: '',
            size: '',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          } as CompanyProfileData);
        }
      } else if (companies && companies.length > 0) {
        // If no selected company, use first company
        const firstCompany = companies[0];
        const companyId = String(firstCompany.id);
        const response = await apiService.getCompany(companyId);
        
        if (response.success && response.data) {
          const apiCompany = response.data;
          setCompanyData({
            ...apiCompany,
            sector: apiCompany.industry || '',
            size: apiCompany.size || '',
            incorporation_date: apiCompany.createdAt || '',
          });
        }
      } else {
        toast({
          title: "No Company",
          description: "Please create or select a company first",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error loading company data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load company data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyData) return;
    
    try {
      setLoading(true);
      const response = await apiService.updateCompany(companyData.id, companyData);
      
      if (response.success && response.data) {
        setCompanyData({
          ...response.data,
          sector: response.data.industry || '',
          incorporation_date: response.data.createdAt || '',
        });
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Company profile updated successfully"
        });
        // Reload company data to get latest from server
        await loadCompanyData();
      } else {
        throw new Error(response.message || 'Failed to update company');
      }
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyProfileData, value: string) => {
    if (!companyData) return;
    setCompanyData({ ...companyData, [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDocument = {
        id: documents.length + 1,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        type: "document"
      };
      setDocuments([...documents, newDocument]);
      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });
    }
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Success",
      description: "Document deleted successfully"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Company Data</h2>
          <p className="text-muted-foreground mb-4">Unable to load company information.</p>
          <Button onClick={loadCompanyData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Company Profile</h1>
              <p className="text-muted-foreground">Manage your company information and documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {companyData.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <Settings className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <Shield className="w-4 h-4" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Company Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tin">TIN Number</Label>
                      <Input
                        id="tin"
                        value={companyData.tin || ""}
                        onChange={(e) => handleInputChange('tin', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registration">RDB Registration Number</Label>
                      <Input
                        id="registration"
                        value={companyData.rdbRegistration || ""}
                        onChange={(e) => handleInputChange('rdbRegistration', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select 
                        value={companyData.size || ""} 
                        onValueChange={(value) => handleInputChange('size', value)}
                        disabled={!isEditing}
                      >
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
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sector">Business Sector</Label>
                      <Select 
                        value={companyData.sector || ""} 
                        onValueChange={(value) => handleInputChange('sector', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance & Banking</SelectItem>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="services">Professional Services</SelectItem>
                          <SelectItem value="retail">Retail & Trade</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select 
                        value={companyData.size || ""} 
                        onValueChange={(value) => handleInputChange('size', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="micro">Micro (1-4 employees)</SelectItem>
                          <SelectItem value="small">Small (5-30 employees)</SelectItem>
                          <SelectItem value="medium">Medium (31-100 employees)</SelectItem>
                          <SelectItem value="large">Large (100+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="incorporation">Incorporation Date</Label>
                      <Input
                        id="incorporation"
                        type="date"
                        value={companyData.incorporation_date || ""}
                        onChange={(e) => handleInputChange('incorporation_date', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={companyData.industry || ""}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Industry sector"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email || ""}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={companyData.phone || ""}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="street"
                        placeholder="Street"
                        value={companyData.address?.street || ""}
                        onChange={(e) => handleInputChange('address', { ...companyData.address, street: e.target.value } as any)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="City"
                          value={companyData.address?.city || ""}
                          onChange={(e) => handleInputChange('address', { ...companyData.address, city: e.target.value } as any)}
                          disabled={!isEditing}
                        />
                        <Input
                          placeholder="District"
                          value={companyData.address?.district || ""}
                          onChange={(e) => handleInputChange('address', { ...companyData.address, district: e.target.value } as any)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Company Status</Label>
                    <Badge 
                      variant={companyData.isActive ? 'default' : 'secondary'}
                      className="w-full justify-center"
                    >
                      {companyData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="created">Created Date</Label>
                    <Input
                      id="created"
                      value={companyData.createdAt ? new Date(companyData.createdAt).toLocaleDateString() : 'N/A'}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="updated">Last Updated</Label>
                    <Input
                      id="updated"
                      value={companyData.updatedAt ? new Date(companyData.updatedAt).toLocaleDateString() : 'N/A'}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                        Choose Files
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX, JPG, PNG up to 10MB each
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size} • {doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Tax Registration</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">RDB Registration</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Annual Returns</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    Manage Directors & Shareholders
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Generate Compliance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    View Compliance Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <CompanyProfileForm open={showForm} onClose={() => setShowForm(false)} />
      </div>
    </div>
  );
}
