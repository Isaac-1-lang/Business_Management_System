import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Building, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { UserService, User } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserDetailsDialog({ open, onClose, userId }: UserDetailsDialogProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUserDetails();
    }
  }, [open, userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await UserService.getUser(userId);
      if (response.success && response.data) {
        setUser(response.data.user);
        setCompanies(response.data.companies || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading user details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "owner":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "accountant":
        return "bg-green-100 text-green-800";
      case "hr":
        return "bg-orange-100 text-orange-800";
      case "employee":
        return "bg-yellow-100 text-yellow-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!user && !loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">
                        {user.firstName} {user.lastName}
                      </h2>
                      <Badge className={getStatusColor(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role and Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                
                {user.department && (
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Department: {user.department}</span>
                  </div>
                )}

                {user.permissions && user.permissions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">Permissions:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {user.isEmailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Email {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Joined: {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Last Login: {formatDate(user.lastLoginAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Companies */}
            {companies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="w-5 h-5" />
                    Associated Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {companies.map((company, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{company.name}</span>
                        {company.registrationNumber && (
                          <Badge variant="outline" className="text-xs">
                            {company.registrationNumber}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
