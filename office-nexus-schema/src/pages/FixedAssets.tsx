import { ArrowLeft, Plus, Building2, Upload, Download, Eye, Filter, Calculator, AlertCircle, TrendingDown, Calendar, Search, FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FixedAssetForm } from "@/components/forms/FixedAssetForm";
import FixedAssetService, { FixedAsset } from "@/services/fixedAssetService";
import UniversalTransactionService from "@/services/universalTransactionService";
import { useToast } from "@/hooks/use-toast";

export default function FixedAssets() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [showDepreciationDialog, setShowDepreciationDialog] = useState(false);

  useEffect(() => {
    loadAssets();
    updateDepreciation();
  }, []);

  const loadAssets = async () => {
    try {
      const allAssets = await FixedAssetService.getAllAssets();
      setAssets(Array.isArray(allAssets) ? allAssets : []);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
    }
  };

  const updateDepreciation = async () => {
    try {
      await FixedAssetService.updateAllDepreciation();
    } catch (error) {
      console.error('Error updating depreciation:', error);
    }
  };

  const handleAssetSuccess = async () => {
    await loadAssets();
  };

  const handleUpdateDepreciation = async () => {
    try {
      await FixedAssetService.updateAllDepreciation();
      await loadAssets();
      toast({
        title: "Depreciation Updated",
        description: "All asset depreciation values have been updated"
      });
    } catch (error) {
      console.error('Error updating depreciation:', error);
      toast({
        title: "Error",
        description: "Failed to update depreciation",
        variant: "destructive"
      });
    }
  };

  const handlePostMonthlyDepreciation = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    UniversalTransactionService.postMonthlyDepreciation(currentMonth);
    handleUpdateDepreciation();
    toast({
      title: "Monthly Depreciation Posted",
      description: "Depreciation entries have been posted to accounting books"
    });
  };

  const handleRetireAsset = async (asset: FixedAsset) => {
    try {
      const success = await FixedAssetService.retireAsset(asset.id, new Date().toISOString().split('T')[0]);
      if (success) {
        await loadAssets();
        toast({
          title: "Asset Retired",
          description: `${asset.name} has been marked as retired`
        });
      }
    } catch (error) {
      console.error('Error retiring asset:', error);
      toast({
        title: "Error",
        description: "Failed to retire asset",
        variant: "destructive"
      });
    }
  };

  const handleExportAssets = async () => {
    try {
      const csvData = await FixedAssetService.exportToCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fixed-assets-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Fixed assets data has been exported to CSV"
      });
    } catch (error) {
      console.error('Error exporting assets:', error);
      toast({
        title: "Error",
        description: "Failed to export assets",
        variant: "destructive"
      });
    }
  };

  const showDepreciationSchedule = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setShowDepreciationDialog(true);
  };

  const [summary, setSummary] = useState<any>({
    totalAssets: 0,
    totalOriginalCost: 0,
    totalCurrentValue: 0,
    totalDepreciation: 0,
    activeAssets: 0,
    retiredAssets: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [depreciationSchedule, setDepreciationSchedule] = useState<any[]>([]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await FixedAssetService.getAssetSummary();
        setSummary(summaryData || {
          totalAssets: 0,
          totalOriginalCost: 0,
          totalCurrentValue: 0,
          totalDepreciation: 0,
          activeAssets: 0,
          retiredAssets: 0
        });
      } catch (error) {
        console.error('Error loading asset summary:', error);
      }
    };
    loadSummary();
  }, [assets]);

  useEffect(() => {
    const uniqueCategories = [...new Set(assets.map(asset => asset.category).filter(Boolean))];
    setCategories(uniqueCategories);
  }, [assets]);

  useEffect(() => {
    const loadDepreciationSchedule = async () => {
      if (selectedAsset) {
        try {
          const schedule = await FixedAssetService.getDepreciationSchedule(selectedAsset.id);
          setDepreciationSchedule(Array.isArray(schedule) ? schedule : []);
        } catch (error) {
          console.error('Error loading depreciation schedule:', error);
          setDepreciationSchedule([]);
        }
      } else {
        setDepreciationSchedule([]);
      }
    };
    loadDepreciationSchedule();
  }, [selectedAsset]);

  const filteredAssets = assets.filter(asset => {
    if (!asset) return false;
    
    const matchesCategory = filterCategory === "all" || (asset.category || "").toLowerCase().includes(filterCategory.toLowerCase());
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      (asset.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.supplier || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'retired':
        return 'bg-yellow-100 text-yellow-800';
      case 'disposed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


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
            <h1 className="text-2xl font-semibold">Fixed Assets Register</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUpdateDepreciation}>
              <Calculator className="w-4 h-4 mr-2" />
              Update Depreciation
            </Button>
            <Button variant="outline" onClick={handlePostMonthlyDepreciation}>
              <FileText className="w-4 h-4 mr-2" />
              Post Monthly Depreciation
            </Button>
            <Button variant="outline" onClick={handleExportAssets}>
              <Upload className="w-4 h-4 mr-2" />
              Export Assets
            </Button>
            <Button onClick={() => setShowAssetForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{summary.totalAssets}</div>
              <div className="text-sm text-gray-600">Total Assets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{FixedAssetService.formatCurrency(summary.totalOriginalCost)}</div>
              <div className="text-sm text-gray-600">Original Cost</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{FixedAssetService.formatCurrency(summary.totalCurrentValue)}</div>
              <div className="text-sm text-gray-600">Current Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{FixedAssetService.formatCurrency(summary.totalDepreciation)}</div>
              <div className="text-sm text-gray-600">Total Depreciation</div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Assets Register
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Search assets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs" 
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Acquisition Date</TableHead>
                  <TableHead className="text-right">Original Cost</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">Useful Life</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const depreciation = FixedAssetService.calculateDepreciation(asset);
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.category}</Badge>
                      </TableCell>
                      <TableCell>{asset.acquisitionDate}</TableCell>
                      <TableCell className="text-right">
                        {FixedAssetService.formatCurrency(asset.acquisitionCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {FixedAssetService.formatCurrency(depreciation.currentBookValue)}
                      </TableCell>
                      <TableCell className="text-right">{asset.usefulLifeYears} years</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => showDepreciationSchedule(asset)}
                            title="View Depreciation Schedule"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {asset.status === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRetireAsset(asset)}
                              title="Retire Asset"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showDepreciationDialog} onOpenChange={setShowDepreciationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Depreciation Schedule - {selectedAsset?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Original Cost</div>
                    <div className="font-semibold">{FixedAssetService.formatCurrency(selectedAsset.acquisitionCost)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Residual Value</div>
                    <div className="font-semibold">{FixedAssetService.formatCurrency(selectedAsset.residualValue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Useful Life</div>
                    <div className="font-semibold">{selectedAsset.usefulLifeYears} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Depreciation Method</div>
                    <div className="font-semibold capitalize">{selectedAsset.depreciationMethod.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Opening Value</TableHead>
                      <TableHead className="text-right">Depreciation</TableHead>
                      <TableHead className="text-right">Closing Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depreciationSchedule.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell className="text-right">
                          {FixedAssetService.formatCurrency(row.openingValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {FixedAssetService.formatCurrency(row.depreciation)}
                        </TableCell>
                        <TableCell className="text-right">
                          {FixedAssetService.formatCurrency(row.closingValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <FixedAssetForm 
          open={showAssetForm} 
          onClose={() => setShowAssetForm(false)}
          onSuccess={handleAssetSuccess}
        />
      </div>
    </div>
  );
}
