import { ArrowLeft, Plus, Edit, Trash, Users, TrendingUp, Building, ArrowRightLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DirectorShareholderForm } from "@/components/forms/DirectorShareholderForm";
import { ShareTransferForm } from "@/components/forms/ShareTransferForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportButton } from "@/components/common/ExportButton";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

interface DirectorShareholder {
  id: number;
  name: string;
  nationalId: string;
  role: string;
  nationality: string;
  shares: string;
  joinDate: string;
  status: string;
  document?: File | null;
}

const AUTHORIZED_SHARES = 10000; // Default authorized shares

export default function DirectorsShareholders() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<DirectorShareholder | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [directors, setDirectors] = useState<DirectorShareholder[]>([]);
  const [shareholders, setShareholders] = useState<DirectorShareholder[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both directors and shareholders from API
      const [directorsResponse, shareholdersResponse] = await Promise.all([
        apiService.getDirectors(),
        apiService.getShareholders()
      ]);

      if (directorsResponse.success && directorsResponse.data) {
        setDirectors(directorsResponse.data.directors || []);
      }

      if (shareholdersResponse.success && shareholdersResponse.data) {
        setShareholders(shareholdersResponse.data.shareholders || []);
      }

      // Combine directors and shareholders for display
      const allPersons = [
        ...(directorsResponse.data?.directors || []),
        ...(shareholdersResponse.data?.shareholders || [])
      ];
      setDirectors(allPersons);

    } catch (error) {
      console.error('Error loading directors/shareholders:', error);
      toast({
        title: "Error",
        description: "Failed to load directors and shareholders data",
        variant: "destructive"
      });
      
      // Fallback to localStorage
      const stored = localStorage.getItem('directors-shareholders');
      if (stored) {
        const parsedDirectors = JSON.parse(stored);
        setDirectors(parsedDirectors);
      }
    } finally {
      setLoading(false);
    }
  };

  const syncDirectorData = async (updatedDirectors: DirectorShareholder[]) => {
    setIsSyncing(true);
    localStorage.setItem('directors-shareholders', JSON.stringify(updatedDirectors));
    
    try {
      const { default: DataIntegrationService } = await import('@/services/dataIntegrationService');
      const { default: AuditLogService } = await import('@/services/auditLogService');
      
      updatedDirectors.forEach(director => {
        DataIntegrationService.syncDirectorToCapital(director);
        AuditLogService.logShareholderChange('update', director.id.toString(), null, director);
      });
      
      // Trigger comprehensive sync
      DataIntegrationService.syncAllData();
      
      toast({
        title: "Data Synchronized",
        description: "Director/shareholder data synced with capital, beneficial ownership, and accounting systems."
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Warning",
        description: "Data saved but some integrations may need manual refresh.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddPerson = async (personData: any) => {
    try {
      const newPersonData = {
        name: personData.fullName,
        nationalId: personData.nationalId,
        role: personData.role,
        nationality: personData.nationality,
        shares: personData.ownershipPercent || "0",
        joinDate: new Date().toISOString().split('T')[0],
        status: "Active"
      };

      // Determine if this is a director or shareholder based on role
      const isDirector = ['Chairman', 'Director', 'CEO', 'Secretary'].includes(personData.role);
      
      let response;
      if (isDirector) {
        response = await apiService.createDirector(newPersonData);
      } else {
        response = await apiService.createShareholder(newPersonData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `${isDirector ? 'Director' : 'Shareholder'} added successfully`
        });
        
        await loadData(); // Reload data from API
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add person",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive"
      });
    }
    
    setShowForm(false);
    setEditingPerson(null);
  };

  const handleEditPerson = (person: DirectorShareholder) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  const handleUpdatePerson = async (personData: any) => {
    if (!editingPerson) return;

    const updatedPerson: DirectorShareholder = {
      ...editingPerson,
      name: personData.fullName,
      nationalId: personData.nationalId,
      role: personData.role,
      nationality: personData.nationality,
      shares: personData.ownershipPercent,
      document: personData.document
    };

    const updatedDirectors = directors.map(d => d.id === editingPerson.id ? updatedPerson : d);
    setDirectors(updatedDirectors);
    await syncDirectorData(updatedDirectors);
    setEditingPerson(null);
    
    toast({
      title: "Success",
      description: "Director/Shareholder updated and synced across all systems."
    });
  };

  const handleDeletePerson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this person? This will update all related records.")) {
      const updatedDirectors = directors.filter(d => d.id !== id);
      setDirectors(updatedDirectors);
      await syncDirectorData(updatedDirectors);
      
      toast({
        title: "Success",
        description: "Director/Shareholder deleted and all related records updated."
      });
    }
  };

  const handleShareTransfer = async (transferData: any) => {
    const fromPerson = directors.find(d => d.id.toString() === transferData.fromShareholder);
    const toPerson = directors.find(d => d.id.toString() === transferData.toShareholder);
    
    if (!fromPerson || !toPerson) return;

    const updatedDirectors = directors.map(director => {
      if (director.id.toString() === transferData.fromShareholder) {
        return {
          ...director,
          shares: (parseFloat(director.shares) - transferData.sharesTransferred).toString()
        };
      } else if (director.id.toString() === transferData.toShareholder) {
        return {
          ...director,
          shares: (parseFloat(director.shares || '0') + transferData.sharesTransferred).toString()
        };
      }
      return director;
    });

    setDirectors(updatedDirectors);
    await syncDirectorData(updatedDirectors);

    // Log the transfer in audit system
    try {
      const { default: AuditLogService } = await import('@/services/auditLogService');
      AuditLogService.logAction({
        action_type: 'update',
        table_name: 'share_transfers',
        record_id: `transfer-${Date.now()}`,
        description: `Share transfer: ${transferData.sharesTransferred} shares from ${fromPerson.name} to ${toPerson.name}`,
        new_data: transferData
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }

    toast({
      title: "Share Transfer Completed",
      description: `${transferData.sharesTransferred} shares transferred and all systems updated.`
    });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const { default: DataIntegrationService } = await import('@/services/dataIntegrationService');
      DataIntegrationService.syncAllData();
      
      toast({
        title: "Sync Complete",
        description: "All data synchronized across capital, beneficial ownership, and accounting systems."
      });
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Some systems may not be fully synchronized. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPerson(null);
  };

  const totalDirectors = directors.filter(d => d.role.toLowerCase().includes('director')).length;
  const totalShareholders = directors.filter(d => d.role.toLowerCase().includes('shareholder')).length;
  const totalShares = directors.reduce((sum, d) => sum + parseFloat(d.shares || '0'), 0);
  const availableShares = AUTHORIZED_SHARES - totalShares;
  const isOverAllocated = totalShares > AUTHORIZED_SHARES;
  const sharesPercentage = (totalShares / AUTHORIZED_SHARES) * 100;

  const exportColumns = [
    { key: 'name', label: 'Name' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'role', label: 'Role' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'shares', label: 'Shares Held' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Directors & Shareholders</h1>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Fully Integrated System
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/capital-equity">
              <Button variant="outline" size="sm">
                <Building className="w-4 h-4 mr-2" />
                View Capital & Equity
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All Data'}
            </Button>
            <ExportButton 
              data={directors} 
              filename="directors-shareholders" 
              title="Directors & Shareholders Register"
              columns={exportColumns}
            />
            <Button 
              variant="outline"
              onClick={() => setShowTransferForm(true)}
              disabled={directors.filter(d => parseFloat(d.shares || '0') > 0).length < 2}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Shares
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Person
            </Button>
          </div>
        </div>

        {/* Navigation Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Capital & Equity Management</h3>
                  <p className="text-sm text-blue-700">
                    View detailed capital structure, beneficial ownership, and financial transactions
                  </p>
                </div>
              </div>
              <Link to="/capital-equity">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Open Capital & Equity →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Share Allocation Alert */}
        {isOverAllocated && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Over-allocation detected!</strong> Total shares ({totalShares.toLocaleString()}) exceed authorized shares ({AUTHORIZED_SHARES.toLocaleString()}). 
              Please review and correct shareholdings. <Link to="/capital-equity" className="underline font-medium">Fix in Capital & Equity →</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Share Summary Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalDirectors}</div>
                  <div className="text-sm text-gray-600">Total Directors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{totalShareholders}</div>
                  <div className="text-sm text-gray-600">Total Shareholders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <div className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-green-600'}`}>
                    {totalShares.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Shares Allocated</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <div className={`text-2xl font-bold ${availableShares < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {availableShares.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Available Shares</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Allocation Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Share Allocation Progress</span>
              <span className="text-sm text-gray-600">
                {sharesPercentage.toFixed(1)}% of authorized shares
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isOverAllocated ? 'bg-red-500' : sharesPercentage > 90 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(sharesPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{AUTHORIZED_SHARES.toLocaleString()} authorized</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Directors & Shareholders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Shares Held</TableHead>
                  <TableHead>% Ownership</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directors.map((director) => {
                  const ownershipPercent = ((parseFloat(director.shares || '0') / AUTHORIZED_SHARES) * 100).toFixed(2);
                  return (
                    <TableRow key={director.id}>
                      <TableCell className="font-medium">{director.name}</TableCell>
                      <TableCell>{director.nationalId}</TableCell>
                      <TableCell>{director.role}</TableCell>
                      <TableCell>{director.nationality}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{parseFloat(director.shares || '0').toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ownershipPercent}%</Badge>
                      </TableCell>
                      <TableCell>{director.joinDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          {director.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditPerson(director)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDeletePerson(director.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <DirectorShareholderForm 
          open={showForm} 
          onClose={handleFormClose}
          onAdd={editingPerson ? handleUpdatePerson : handleAddPerson}
          editData={editingPerson}
          currentDirectors={directors}
          authorizedShares={AUTHORIZED_SHARES}
        />

        <ShareTransferForm
          open={showTransferForm}
          onClose={() => setShowTransferForm(false)}
          onTransfer={handleShareTransfer}
          directors={directors}
        />
      </div>
    </div>
  );
}
