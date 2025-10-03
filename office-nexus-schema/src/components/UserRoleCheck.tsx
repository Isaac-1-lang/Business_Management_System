import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserService } from "@/services/userService";
import { AlertTriangle, User, Shield, Info } from "lucide-react";

export function UserRoleCheck() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await UserService.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUser(response.data.user);
      } else {
        setError(response.message || 'Failed to load user information');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
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

  const hasUserManagementAccess = (role: string) => {
    return ['admin', 'owner', 'hr', 'manager'].includes(role?.toLowerCase());
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Checking your permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentUser) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to verify your user role. Please try logging in again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasUserManagementAccess(currentUser.role)) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-3">
          <div>
            <strong>Access Denied:</strong> You don't have permission to access user management.
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Your current role:</span>
            <Badge className={getRoleColor(currentUser.role)}>
              {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1)}
            </Badge>
          </div>
          <div className="text-sm">
            Required roles: Administrator, Owner, HR Officer, or Manager
          </div>
          <div className="text-sm">
            Contact your administrator to request access or role change.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Shield className="h-5 w-5" />
          Access Granted
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>
          <Badge className={getRoleColor(currentUser.role)}>
            {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-green-700">
            <Info className="h-3 w-3" />
            <span>You have access to user management</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
