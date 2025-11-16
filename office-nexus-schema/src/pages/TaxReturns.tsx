
import { ArrowLeft, Plus, Receipt, Upload, Download, Eye, Filter, AlertTriangle, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TaxReturnForm } from "@/components/forms/TaxReturnForm";
import { QITForm } from "@/components/forms/QITForm";
import TaxService from "@/services/taxService";
import { useToast } from "@/hooks/use-toast";

interface TaxReturn {
  id: number;
  taxType: string;
  period: string;
  submissionDate: string;
  totalDeclared: number;
  status: string;
  dueDate: string;
}

export default function TaxReturns() {
  const { toast } = useToast();
  const [showTaxReturnForm, setShowTaxReturnForm] = useState(false);
  const [showQITForm, setShowQITForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<TaxReturn | null>(null);
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get tax summary for dashboard metrics
  const [taxSummary, setTaxSummary] = useState<any>(null);

  useEffect(() => {
    loadTaxReturns();
    // Load tax summary
    TaxService.getTaxSummary().then(setTaxSummary).catch(console.error);
  }, []);

  const loadTaxReturns = async () => {
    setIsLoading(true);
    try {
      // Simulate loading real data
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const loadedReturns: TaxReturn[] = [
        {
          id: 1,
          taxType: "VAT",
          period: `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}`,
          submissionDate: "2024-07-10",
          totalDeclared: taxSummary.vat_due,
          status: "Filed",
          dueDate: taxSummary.next_filing_dates.vat
        },
        {
          id: 2,
          taxType: "PAYE",
          period: `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}`,
          submissionDate: "2024-07-12",
          totalDeclared: taxSummary.paye_due,
          status: "Filed",
          dueDate: taxSummary.next_filing_dates.paye
        },
        {
          id: 3,
          taxType: "VAT",
          period: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
          submissionDate: "",
          totalDeclared: 0,
          status: "Pending",
          dueDate: taxSummary.next_filing_dates.vat
        },
        {
          id: 4,
          taxType: "CIT",
          period: String(currentYear - 1),
          submissionDate: "",
          totalDeclared: taxSummary.cit_due,
          status: getDaysUntilDue(taxSummary.next_filing_dates.cit) < 0 ? "Overdue" : "Pending",
          dueDate: taxSummary.next_filing_dates.cit
        },
        {
          id: 5,
          taxType: "QIT",
          period: `Q${Math.ceil(currentMonth / 3)} ${currentYear}`,
          submissionDate: "",
          totalDeclared: taxSummary.qit_due,
          status: taxSummary.qit_due > 0 ? "Pending" : "Filed",
          dueDate: taxSummary.next_filing_dates.qit
        }
      ];
      
      setReturns(loadedReturns);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tax returns",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesType = filterType === "all" || returnItem.taxType.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = returnItem.taxType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.period.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Filed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateCurrentReturns = async () => {
    setIsLoading(true);
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    try {
      const vatReturn = await TaxService.generateVATReturn(currentMonth);
      const payeReturn = await TaxService.generatePAYEReturn(currentMonth);
      
      console.log('VAT Return:', vatReturn);
      console.log('PAYE Return:', payeReturn);
      
      // Refresh tax summary
      const summary = await TaxService.getTaxSummary();
      setTaxSummary(summary);
      
      toast({
        title: "Returns Generated",
        description: `Current month tax returns calculated. VAT: ${TaxService.formatCurrency(vatReturn.net_vat_payable)}, PAYE: ${TaxService.formatCurrency(payeReturn.total_paye)}`
      });
      
      // Reload returns to reflect new data
      await loadTaxReturns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate current returns",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReturns = () => {
    const exportData = {
      summary: taxSummary,
      returns: returns,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `tax_returns_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Export Complete",
      description: "Tax returns data has been exported successfully"
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    return TaxService.getDaysUntilDeadline(dueDate);
  };

  const handleViewReturn = (returnItem: TaxReturn) => {
    setSelectedReturn(returnItem);
    if (returnItem.taxType === 'QIT') {
      setShowQITForm(true);
    } else {
      setShowTaxReturnForm(true);
    }
  };

  const handleMarkAsFiled = (returnId: number) => {
    setReturns(prev => prev.map(ret => 
      ret.id === returnId 
        ? { ...ret, status: 'Filed', submissionDate: new Date().toISOString().split('T')[0] }
        : ret
    ));
    
    toast({
      title: "Return Filed",
      description: "Tax return has been marked as filed"
    });
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
            <h1 className="text-2xl font-semibold">Tax Returns & Compliance</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReturns}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={handleGenerateCurrentReturns} disabled={isLoading}>
              <FileText className="w-4 h-4 mr-2" />
              {isLoading ? "Calculating..." : "Calculate Current"}
            </Button>
            <Button onClick={() => setShowQITForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Record QIT
            </Button>
            <Button onClick={() => setShowTaxReturnForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Return
            </Button>
          </div>
        </div>

        {/* Tax Summary Dashboard */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {TaxService.formatCurrency(taxSummary.vat_due)}
                  </div>
                  <div className="text-sm text-gray-600">VAT Due</div>
                  <div className="text-xs text-red-500">
                    Due: {taxSummary.next_filing_dates.vat}
                  </div>
                </div>
                <Receipt className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {TaxService.formatCurrency(taxSummary.paye_due)}
                  </div>
                  <div className="text-sm text-gray-600">PAYE Due</div>
                  <div className="text-xs text-red-500">
                    Due: {taxSummary.next_filing_dates.paye}
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {TaxService.formatCurrency(taxSummary.cit_due)}
                  </div>
                  <div className="text-sm text-gray-600">CIT Estimated</div>
                  <div className="text-xs text-red-500">
                    Due: {taxSummary.next_filing_dates.cit}
                  </div>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {returns.filter(r => r.status === "Pending" || r.status === "Overdue").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Returns</div>
                  <div className="text-xs text-orange-500">Action Required</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filing Alerts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Upcoming Filing Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "VAT", date: taxSummary.next_filing_dates.vat, amount: taxSummary.vat_due },
                { type: "PAYE", date: taxSummary.next_filing_dates.paye, amount: taxSummary.paye_due },
                { type: "CIT", date: taxSummary.next_filing_dates.cit, amount: taxSummary.cit_due },
                { type: "QIT", date: taxSummary.next_filing_dates.qit, amount: taxSummary.qit_due }
              ].map((deadline, index) => {
                const daysLeft = getDaysUntilDue(deadline.date);
                const isUrgent = daysLeft <= 7;
                
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isUrgent ? 'bg-red-50 border-red-200 border' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <Badge variant={isUrgent ? "destructive" : "secondary"}>
                        {deadline.type}
                      </Badge>
                      <span className="font-medium">{deadline.date}</span>
                      <span className={`text-sm ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                        ({daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{TaxService.formatCurrency(deadline.amount)}</div>
                      <div className="text-xs text-gray-500">Estimated</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Returns History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Tax Returns Register
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-1 text-sm bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="vat">VAT</option>
                  <option value="paye">PAYE</option>
                  <option value="cit">CIT</option>
                  <option value="qit">QIT</option>
                </select>
                <Input 
                  placeholder="Search returns..." 
                  className="max-w-xs" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead className="text-right">Total Declared</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge variant="outline">{returnItem.taxType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{returnItem.period}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {returnItem.dueDate}
                          {getDaysUntilDue(returnItem.dueDate) <= 7 && getDaysUntilDue(returnItem.dueDate) > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {getDaysUntilDue(returnItem.dueDate)}d
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{returnItem.submissionDate || "Not submitted"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {returnItem.totalDeclared > 0 ? 
                          TaxService.formatCurrency(returnItem.totalDeclared) : 
                          "Pending"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(returnItem.status)}>
                          {returnItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="View Details"
                            onClick={() => handleViewReturn(returnItem)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Download"
                            onClick={handleExportReturns}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {returnItem.status === 'Pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Mark as Filed"
                              onClick={() => handleMarkAsFiled(returnItem.id)}
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TaxReturnForm
          open={showTaxReturnForm}
          onClose={() => {
            setShowTaxReturnForm(false);
            setSelectedReturn(null);
          }}
          onSuccess={async () => {
            toast({
              title: "Success",
              description: "Tax return has been generated and saved"
            });
            await loadTaxReturns();
          }}
        />

        <QITForm
          open={showQITForm}
          onClose={() => {
            setShowQITForm(false);
            setSelectedReturn(null);
          }}
          onSuccess={async () => {
            const summary = await TaxService.getTaxSummary();
            setTaxSummary(summary);
            await loadTaxReturns();
          }}
        />
      </div>
    </div>
  );
}
