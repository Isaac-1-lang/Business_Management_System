
import { ArrowLeft, Plus, FileText, Upload, Download, Eye, Filter, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuditReportForm from "@/components/forms/AuditReportForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InternalAuditReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const filteredReports = reports.filter(report => {
    const matchesType = filterType === "all" || report.auditType.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddReport = (formData: any) => {
    const newReport = {
      id: reports.length + 1,
      ...formData,
      reportDate: formData.reportDate || ""
    };
    setReports([...reports, newReport]);
    toast({
      title: "Success",
      description: "Audit report has been added successfully.",
    });
  };

  const handleEditReport = (formData: any) => {
    setReports(reports.map(report => 
      report.id === editingReport.id 
        ? { ...report, ...formData }
        : report
    ));
    setEditingReport(null);
    toast({
      title: "Success",
      description: "Audit report has been updated successfully.",
    });
  };

  const handleDeleteReport = () => {
    setReports(reports.filter(report => report.id !== reportToDelete.id));
    setDeleteDialogOpen(false);
    setReportToDelete(null);
    toast({
      title: "Success",
      description: "Audit report has been deleted successfully.",
    });
  };

  const handleViewReport = (report: any) => {
    toast({
      title: "View Report",
      description: `Opening ${report.title} - this would typically open a document viewer.`,
    });
  };

  const handleDownloadReport = (report: any) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.title} - this would typically start a file download.`,
    });
  };

  const handleUploadReport = () => {
    toast({
      title: "Upload Feature",
      description: "This would open a file upload dialog for bulk report uploads.",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedCount = reports.filter(r => r.status === "Completed").length;
  const inProgressCount = reports.filter(r => r.status === "In Progress").length;
  const totalFindings = reports.reduce((sum, r) => sum + r.findings, 0);

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
            <h1 className="text-2xl font-semibold">Internal Audit Reports</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUploadReport}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Report
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Report
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{reports.length}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalFindings}</div>
              <div className="text-sm text-gray-600">Total Findings</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Reports Register
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="financial">Financial</option>
                  <option value="it">IT</option>
                  <option value="compliance">Compliance</option>
                  <option value="operational">Operational</option>
                </select>
                <Input 
                  placeholder="Search reports..." 
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Title</TableHead>
                  <TableHead>Audit Type</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Period Audited</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.auditType}</Badge>
                    </TableCell>
                    <TableCell>{report.auditor}</TableCell>
                    <TableCell>{report.auditedPeriod}</TableCell>
                    <TableCell>{report.reportDate || "TBD"}</TableCell>
                    <TableCell>{report.findings}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingReport(report);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setReportToDelete(report);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AuditReportForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={editingReport ? handleEditReport : handleAddReport}
          editData={editingReport}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Audit Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReport}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
