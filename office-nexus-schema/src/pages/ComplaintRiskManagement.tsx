
import { ArrowLeft, Plus, AlertTriangle, Upload, Download, Eye, Filter, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ComplaintRiskForm from "@/components/forms/ComplaintRiskForm";

export default function ComplaintRiskManagement() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Late Payment Complaint",
      category: "Client Complaint",
      description: "Client complained about delayed payment processing",
      reportedDate: "2024-04-15",
      assignedTo: "Finance Manager",
      priority: "Medium",
      status: "In Progress",
      deadline: "2024-04-30"
    },
    {
      id: 2,
      title: "Data Security Risk",
      category: "Risk",
      description: "Potential vulnerability in employee data access",
      reportedDate: "2024-04-10",
      assignedTo: "IT Manager",
      priority: "High",
      status: "Open",
      deadline: "2024-04-25"
    },
    {
      id: 3,
      title: "Workplace Safety Issue",
      category: "Compliance Issue",
      description: "Inadequate safety equipment in warehouse",
      reportedDate: "2024-03-28",
      assignedTo: "HR Manager",
      priority: "High",
      status: "Resolved",
      deadline: "2024-04-15"
    }
  ]);

  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesCategory = filterCategory === "all" || complaint.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch = searchTerm === "" || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleAddIssue = (issueData: any) => {
    setComplaints([issueData, ...complaints]);
  };

  const handleEditIssue = (issueData: any) => {
    setComplaints(complaints.map(c => c.id === issueData.id ? issueData : c));
    setEditingIssue(null);
  };

  const handleDeleteIssue = (id: number) => {
    setComplaints(complaints.filter(c => c.id !== id));
    toast({
      title: "Success",
      description: "Issue deleted successfully"
    });
  };

  const handleViewIssue = (issue: any) => {
    toast({
      title: issue.title,
      description: `Category: ${issue.category} | Status: ${issue.status}`
    });
  };

  const handleDownloadReport = (issue: any) => {
    toast({
      title: "Download Started",
      description: `Downloading report for: ${issue.title}`
    });
  };

  const handleImportIssues = () => {
    toast({
      title: "Import Feature",
      description: "Import functionality would be implemented here"
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Open": return "bg-red-100 text-red-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-purple-100 text-purple-800";
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const totalIssues = complaints.length;
  const openIssues = complaints.filter(c => c.status === "Open").length;
  const inProgressIssues = complaints.filter(c => c.status === "In Progress").length;
  const resolvedIssues = complaints.filter(c => c.status === "Resolved").length;

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
            <h1 className="text-2xl font-semibold">Complaint & Risk Management</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportIssues}>
              <Upload className="w-4 h-4 mr-2" />
              Import Issues
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Issue
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalIssues}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{openIssues}</div>
              <div className="text-sm text-gray-600">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{inProgressIssues}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{resolvedIssues}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Issues & Complaints Log
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="client">Client Complaint</option>
                  <option value="risk">Risk</option>
                  <option value="compliance">Compliance Issue</option>
                  <option value="safety">Safety Issue</option>
                  <option value="hr">HR Issue</option>
                  <option value="it">IT Security</option>
                  <option value="financial">Financial Risk</option>
                </select>
                <Input 
                  placeholder="Search issues..." 
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reported Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                    <TableCell>{complaint.reportedDate}</TableCell>
                    <TableCell>{complaint.assignedTo}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadgeColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{complaint.deadline}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewIssue(complaint)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingIssue(complaint);
                            setShowForm(true);
                          }}
                          title="Edit Issue"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadReport(complaint)}
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Delete Issue">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{complaint.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteIssue(complaint.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ComplaintRiskForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingIssue(null);
          }}
          issue={editingIssue}
          onSubmit={editingIssue ? handleEditIssue : handleAddIssue}
        />
      </div>
    </div>
  );
}
