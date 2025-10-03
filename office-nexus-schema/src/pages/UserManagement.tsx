
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Users, Shield, Edit, Trash2, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserService, User, UserStats } from "@/services/userService";
import { UserForm } from "@/components/forms/UserForm";
import { RoleManagementDialog } from "@/components/forms/RoleManagementDialog";
import { UserDetailsDialog } from "@/components/forms/UserDetailsDialog";
import { UserRoleCheck } from "@/components/UserRoleCheck";

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [roleManagementOpen, setRoleManagementOpen] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filters, pagination.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (filters.role) params.role = filters.role;
      if (filters.status !== '') params.isActive = filters.status === 'active';

      const response = await UserService.getUsers(params);
      if (response.success && response.data) {
        let filteredUsers = response.data.users;
        
        // Apply search filter on frontend
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
          );
        }
        
        setUsers(filteredUsers);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      } else {
        // Handle specific error codes
        if (response.code === 'INSUFFICIENT_PERMISSIONS') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view user management. Contact your administrator.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load users",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please check your permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await UserService.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "owner": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "accountant": return "bg-green-100 text-green-800";
      case "hr": return "bg-orange-100 text-orange-800";
      case "employee": return "bg-yellow-100 text-yellow-800";
      case "viewer": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setUserFormOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUserId(user.id);
    setUserDetailsOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      try {
        const response = await UserService.deleteUser(user.id);
        if (response.success) {
          toast({
            title: "Success",
            description: "User deleted successfully"
          });
          loadUsers();
          loadStats();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete user",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "An error occurred while deleting the user",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = user.isActive 
        ? await UserService.deactivateUser(user.id)
        : await UserService.activateUser(user.id);
        
      if (response.success) {
        toast({
          title: "Success",
          description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`
        });
        loadUsers();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating user status",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    loadUsers();
    loadStats();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeUsers = stats?.activeUsers || 0;
  const inactiveUsers = stats?.inactiveUsers || 0;
  const totalUsers = stats?.totalUsers || 0;

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
            <Button variant="outline" onClick={() => setRoleManagementOpen(true)}>
              <Shield className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Role Check */}
        <UserRoleCheck />

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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="hr">HR Officer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({ role: '', status: '', search: '' });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              System Users {loading && <RefreshCw className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(user.isActive)}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? '🔴' : '🟢'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(user.lastLoginAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.permissions.length > 0 ? (
                            user.permissions.slice(0, 3).map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission.replace(/_/g, ' ')}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No permissions</span>
                          )}
                          {user.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <UserForm
          open={userFormOpen}
          onClose={() => setUserFormOpen(false)}
          onSuccess={handleFormSuccess}
          user={selectedUser}
          isEdit={isEditMode}
        />

        <RoleManagementDialog
          open={roleManagementOpen}
          onClose={() => setRoleManagementOpen(false)}
        />

        <UserDetailsDialog
          open={userDetailsOpen}
          onClose={() => setUserDetailsOpen(false)}
          userId={selectedUserId}
        />
      </div>
    </div>
  );
}
