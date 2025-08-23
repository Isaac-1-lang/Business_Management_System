import { ArrowLeft, Plus, Users, Upload, Download, Eye, Filter, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmployeeForm } from "@/components/forms/EmployeeForm";

export default function EmployeeRecords() {
  const [showForm, setShowForm] = useState(false);
  const [employees] = useState([
    {
      id: 1,
      name: "Jean Claude Mugabo",
      nationalId: "1198780123456789",
      role: "Software Developer",
      department: "IT",
      salary: 2500000,
      startDate: "2022-03-15",
      rssb: "RS123456789",
      status: "Active",
      contract: "contract_mugabo.pdf"
    },
    {
      id: 2,
      name: "Marie Uwimana",
      nationalId: "1199185098765432",
      role: "Accountant",
      department: "Finance",
      salary: 1800000,
      startDate: "2021-08-20",
      rssb: "RS987654321",
      status: "Active",
      contract: "contract_uwimana.pdf"
    },
    {
      id: 3,
      name: "Paul Nkurunziza",
      nationalId: "1197512345678901",
      role: "HR Manager",
      department: "Human Resources",
      salary: 2200000,
      startDate: "2020-01-10",
      rssb: "RS456789123",
      status: "Active",
      contract: "contract_nkurunziza.pdf"
    },
    {
      id: 4,
      name: "Grace Mukamana",
      nationalId: "1198456789012345",
      role: "Marketing Specialist",
      department: "Marketing",
      salary: 1500000,
      startDate: "2023-06-01",
      rssb: "RS789123456",
      status: "Terminated",
      contract: "contract_mukamana.pdf"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEmployees = employees.filter(employee => 
    filterStatus === "all" || employee.status.toLowerCase() === filterStatus
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
            <h1 className="text-2xl font-semibold">Employee Records</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Records
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Active Employees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600">Terminated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-gray-600">Departments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">RWF 2.0M</div>
              <div className="text-sm text-gray-600">Avg. Salary</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Directory
              </CardTitle>
              <div className="flex items-center gap-2">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="terminated">Terminated</option>
                </select>
                <select className="border rounded px-3 py-1 text-sm">
                  <option value="all">All Departments</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="marketing">Marketing</option>
                </select>
                <Input placeholder="Search employees..." className="max-w-xs" />
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
                  <TableHead>National ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Salary (RWF)</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>RSSB Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="font-mono text-sm">{employee.nationalId}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{employee.salary.toLocaleString()}</TableCell>
                    <TableCell>{employee.startDate}</TableCell>
                    <TableCell className="font-mono text-sm">{employee.rssb}</TableCell>
                    <TableCell>
                      <Badge 
                        className={employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      >
                        {employee.status === 'Active' ? <Users className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                        {employee.status}
                      </Badge>
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

        <EmployeeForm open={showForm} onClose={() => setShowForm(false)} />
      </div>
    </div>
  );
}
