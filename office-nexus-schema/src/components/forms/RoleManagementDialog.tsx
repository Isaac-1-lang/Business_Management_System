import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Eye, Edit, Lock } from "lucide-react";
import { UserService, UserRole } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

interface RoleManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RoleManagementDialog({ open, onClose }: RoleManagementDialogProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await UserService.getRoles();
      if (response.success && response.data) {
        setRoles(response.data.roles);
      } else {
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'owner':
        return <Lock className="w-5 h-5 text-red-600" />;
      case 'manager':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'accountant':
        return <Edit className="w-5 h-5 text-green-600" />;
      case 'hr':
        return <Users className="w-5 h-5 text-orange-600" />;
      case 'viewer':
        return <Eye className="w-5 h-5 text-gray-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accountant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hr':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'employee':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      'all': 'Full system access',
      'company_manage': 'Manage company settings',
      'user_manage': 'Manage users and permissions',
      'finance_manage': 'Manage financial data',
      'finance_view': 'View financial reports',
      'reports_view': 'View reports and analytics',
      'employee_manage': 'Manage employee records',
      'payroll_manage': 'Manage payroll operations',
      'compliance_view': 'View compliance reports',
      'tax_manage': 'Manage tax operations',
      'profile_view': 'View own profile',
      'documents_view': 'View documents'
    };
    return descriptions[permission] || permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Management
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getRoleIcon(role.id)}
                      {role.name}
                      <Badge className={getRoleColor(role.id)}>
                        {role.id.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {role.description}
                    </p>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Permissions:</h4>
                      <div className="space-y-1">
                        {role.permissions.map((permission, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-xs text-gray-700">
                              {getPermissionDescription(permission)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Role Hierarchy</h3>
              <p className="text-sm text-blue-700 mb-2">
                The system follows a hierarchical permission structure:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Administrator:</strong> Complete system control</li>
                <li><strong>Company Owner:</strong> Full company management</li>
                <li><strong>Manager:</strong> Department and team management</li>
                <li><strong>Accountant:</strong> Financial data management</li>
                <li><strong>HR Officer:</strong> Employee and payroll management</li>
                <li><strong>Employee:</strong> Basic access to personal data</li>
                <li><strong>Viewer:</strong> Read-only access to reports</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
