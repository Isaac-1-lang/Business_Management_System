
import { ArrowLeft, Plus, FileText, Upload, Download, Eye, Filter, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ContractForm } from "@/components/forms/ContractForm";

export default function ContractsAgreements() {
  const [showForm, setShowForm] = useState(false);
  const [contracts, setContracts] = useState([]);

  const [filterType, setFilterType] = useState("all");

  const filteredContracts = contracts.filter(contract => 
    filterType === "all" || contract.type.toLowerCase().includes(filterType.toLowerCase())
  );

  const addContract = (contract: any) => {
    const newContract = {
      ...contract,
      id: Date.now()
    };
    setContracts([...contracts, newContract]);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Expiring Soon": return "bg-yellow-100 text-yellow-800";
      case "Expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
            <h1 className="text-2xl font-semibold">Contracts & Agreements</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Contract
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contract
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{contracts.length}</div>
              <div className="text-sm text-gray-600">Total Contracts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {contracts.filter(c => c.status === "Active").length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {contracts.filter(c => c.status === "Expiring Soon").length}
              </div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                RWF {contracts.reduce((sum, c) => sum + c.value, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contracts Register
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="lease">Lease</option>
                  <option value="supplier">Supplier</option>
                  <option value="consultant">Consultant</option>
                </select>
                <Input placeholder="Search contracts..." className="max-w-xs" />
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
                  <TableHead>Contract Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value (RWF)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{contract.type}</Badge>
                    </TableCell>
                    <TableCell>{contract.parties}</TableCell>
                    <TableCell>{contract.startDate}</TableCell>
                    <TableCell>{contract.endDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(contract.status)}>
                        {contract.status === "Expiring Soon" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {contract.value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ContractForm 
          open={showForm} 
          onClose={() => setShowForm(false)} 
          onAdd={addContract}
        />
      </div>
    </div>
  );
}
