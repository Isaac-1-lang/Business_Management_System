
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, Users, DollarSign, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { CompanyCapitalForm } from "@/components/forms/CompanyCapitalForm";
import { EnhancedBeneficialOwnerForm } from "@/components/forms/EnhancedBeneficialOwnerForm";
import CompanyCapitalService, { CompanyCapital, ShareholderRecord } from "@/services/companyCapitalService";
import BeneficialOwnerService, { BeneficialOwner } from "@/services/beneficialOwnerService";
import { useToast } from "@/hooks/use-toast";

export function CapitalManagementDashboard() {
  const { toast } = useToast();
  const [showCapitalForm, setShowCapitalForm] = useState(false);
  const [showBOForm, setShowBOForm] = useState(false);
  const [editingBO, setEditingBO] = useState<BeneficialOwner | null>(null);
  
  const [companyCapital, setCompanyCapital] = useState<CompanyCapital | null>(null);
  const [shareholders, setShareholders] = useState<ShareholderRecord[]>([]);
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([]);
  const [capitalSummary, setCapitalSummary] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const capital = CompanyCapitalService.getCompanyCapital();
    const shareholdersList = CompanyCapitalService.getAllShareholders();
    const boList = BeneficialOwnerService.getAllBeneficialOwners();
    const summary = CompanyCapitalService.getCapitalSummary();

    setCompanyCapital(capital);
    setShareholders(shareholdersList);
    setBeneficialOwners(boList);
    setCapitalSummary(summary);
  };

  const handleCapitalSuccess = () => {
    loadData();
    toast({
      title: "Success",
      description: "Capital structure updated successfully"
    });
  };

  const handleBOSuccess = () => {
    loadData();
    setEditingBO(null);
  };

  const handleEditBO = (bo: BeneficialOwner) => {
    setEditingBO(bo);
    setShowBOForm(true);
  };

  const handleDeleteBO = (id: string) => {
    if (window.confirm("Are you sure you want to delete this beneficial owner?")) {
      BeneficialOwnerService.deleteBeneficialOwner(id);
      loadData();
      toast({
        title: "Success",
        description: "Beneficial owner deleted successfully"
      });
    }
  };

  const boValidation = BeneficialOwnerService.validateOwnershipPercentages();

  return (
    <div className="space-y-6">
      {/* Capital Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {companyCapital ? companyCapital.authorized_shares.toLocaleString() : 'Not Set'}
                </div>
                <div className="text-sm text-gray-600">Authorized Shares</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {companyCapital ? companyCapital.issued_shares.toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600">Issued Shares</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {capitalSummary ? `${capitalSummary.paid_up_capital.toLocaleString()} RWF` : '0'}
                </div>
                <div className="text-sm text-gray-600">Paid-up Capital</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{beneficialOwners.length}</div>
                <div className="text-sm text-gray-600">Beneficial Owners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Actions */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          {!companyCapital && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Company capital structure not initialized. Please set up your authorized shares first.
              </AlertDescription>
            </Alert>
          )}
          
          {!boValidation.isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Beneficial ownership validation issues: {boValidation.violations.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowCapitalForm(true)} variant="outline">
            <Building className="w-4 h-4 mr-2" />
            {companyCapital ? 'Edit Capital' : 'Setup Capital'}
          </Button>
          <Button onClick={() => setShowBOForm(true)} disabled={!companyCapital}>
            <Plus className="w-4 h-4 mr-2" />
            Add Beneficial Owner
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shareholders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shareholders">Shareholders</TabsTrigger>
          <TabsTrigger value="beneficial-owners">Beneficial Owners</TabsTrigger>
          <TabsTrigger value="capital-contributions">Capital Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="shareholders">
          <Card>
            <CardHeader>
              <CardTitle>Current Shareholders</CardTitle>
            </CardHeader>
            <CardContent>
              {shareholders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shareholders registered yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Shares Held</TableHead>
                      <TableHead>Ownership %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shareholders.map((shareholder) => (
                      <TableRow key={shareholder.id}>
                        <TableCell className="font-medium">{shareholder.name}</TableCell>
                        <TableCell>{shareholder.national_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{shareholder.shares_held.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{shareholder.share_percentage.toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={shareholder.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {shareholder.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficial-owners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Beneficial Owners Register
              </CardTitle>
            </CardHeader>
            <CardContent>
              {beneficialOwners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No beneficial owners registered yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Ownership %</TableHead>
                      <TableHead>Control %</TableHead>
                      <TableHead>Significant Control</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficialOwners.map((bo) => (
                      <TableRow key={bo.id}>
                        <TableCell className="font-medium">{bo.full_name}</TableCell>
                        <TableCell>{bo.nationality}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bo.ownership_percentage.toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bo.control_percentage.toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={bo.has_significant_control ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                            {bo.has_significant_control ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            bo.verification_status === 'verified' ? "bg-green-100 text-green-700" :
                            bo.verification_status === 'rejected' ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }>
                            {bo.verification_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditBO(bo)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteBO(bo.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capital-contributions">
          <Card>
            <CardHeader>
              <CardTitle>Capital Contribution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Capital contribution tracking will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompanyCapitalForm
        open={showCapitalForm}
        onClose={() => setShowCapitalForm(false)}
        onSuccess={handleCapitalSuccess}
        editData={companyCapital}
      />

      <EnhancedBeneficialOwnerForm
        open={showBOForm}
        onClose={() => {
          setShowBOForm(false);
          setEditingBO(null);
        }}
        onSuccess={handleBOSuccess}
        editData={editingBO}
      />
    </div>
  );
}
