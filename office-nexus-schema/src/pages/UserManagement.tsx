
import { useState } from "react";
import { ArrowLeft, Plus, Users, Shield, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const { toast } = useToast();
  const [users] = useState([
    {
      id: 1,
      name: "John Admin",
      email: "admin@company.com",
      role: "Administrator",
      department: "IT",
      status: "Active",
      lastLogin: "2024-07-12 14:30",
      permissions: ["Full Access"]
    },
    {
      id: 2,
      name: "Jane Accountant",
      email: "jane@company.com",
      role: "Accountant",
      department: "Finance",
      status: "Active",
      lastLogin: "2024-07-12 09:15",
      permissions: ["Finance", "Reports"]
    },
    {
      id: 3,
      name: "Bob HR",
      email: "bob@company.com",
      role: "HR Officer",
      department: "Human Resources",
      status: "Active",
      lastLogin: "2024-07-11 16:45",
      permissions: ["HR", "Employees"]
    },
    {
      id: 4,
      name: "Alice Compliance",
      email: "alice@company.com",
      role: "Compliance Officer",
      department: "Legal",
      status: "Inactive",
      lastLogin: "2024-07-08 11:20",
      permissions: ["Compliance", "Documents"]
    },
    {
      id: 5,
      name: "Mike Viewer",
      email: "mike@company.com",
      role: "Viewer",
      department: "Operations",
      status: "Active",
      lastLogin: "2024-07-12 08:00",
      permissions: ["Read Only"]
    }
  ]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrator": return "bg-purple-100 text-purple-800";
      case "accountant": return "bg-green-100 text-green-800";
      case "hr officer": return "bg-blue-100 text-blue-800";
      case "compliance officer": return "bg-orange-100 text-orange-800";
      case "viewer": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "suspended": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddUser = () => {
    toast({
      title: "Add User",
      description: "User creation form will be implemented"
    });
  };

  const handleEditUser = (userId: number) => {
    toast({
      title: "Edit User",
      description: "User edit form will be implemented"
    });
  };

  const handleDeleteUser = (userId: number) => {
    toast({
      title: "User Deleted",
      description: "User has been removed from the system"
    });
  };

  const handleViewUser = (userId: number) => {
    toast({
      title: "User Details",
      description: "User details view will be implemented"
    });
  };

  const activeUsers = users.filter(user => user.status === "Active").length;
  const inactiveUsers = users.filter(user => user.status === "Inactive").length;
  const totalUsers = users.length;

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
            <h1 className="text-2xl font-semibold">User Management</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
              <div className="text-sm text-gray-600">Inactive Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-gray-600">Roles Defined</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              System Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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
      </div>
    </div>
  );
}
