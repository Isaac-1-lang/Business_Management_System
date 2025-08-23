import { ArrowLeft, Plus, Users, Upload, Download, Eye, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ClientSupplierForm } from "@/components/forms/ClientSupplierForm";

export default function ClientSupplierRegisters() {
  const [showForm, setShowForm] = useState(false);
  const [entities] = useState([
    {
      id: 1,
      name: "Kigali Tech Solutions",
      type: "Client",
      category: "Company",
      taxId: "100123456",
      contact: "info@kigalitech.rw",
      phone: "+250788123456",
      status: "Active"
    },
    {
      id: 2,
      name: "Office Supplies Rwanda Ltd",
      type: "Supplier",
      category: "Company",
      taxId: "100987654",
      contact: "sales@officesupplies.rw",
      phone: "+250789987654",
      status: "Active"
    },
    {
      id: 3,
      name: "John Uwimana",
      type: "Supplier",
      category: "Individual",
      taxId: "1198012345678901",
      contact: "john.uwimana@gmail.com",
      phone: "+250788567890",
      status: "Active"
    }
  ]);

  const [filterType, setFilterType] = useState("all");

  const filteredEntities = entities.filter(entity => 
    filterType === "all" || entity.type.toLowerCase().includes(filterType.toLowerCase())
  );

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
            <h1 className="text-2xl font-semibold">Client & Supplier Registers</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Contacts
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Suppliers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Client & Supplier Directory
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="client">Clients</option>
                  <option value="supplier">Suppliers</option>
                </select>
                <Input placeholder="Search contacts..." className="max-w-xs" />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tax ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell className="font-medium">{entity.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={entity.type === "Client" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                      >
                        {entity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{entity.category}</TableCell>
                    <TableCell>{entity.taxId}</TableCell>
                    <TableCell>{entity.contact}</TableCell>
                    <TableCell>{entity.phone}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{entity.status}</Badge>
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

        <ClientSupplierForm open={showForm} onClose={() => setShowForm(false)} />
      </div>
    </div>
  );
}
