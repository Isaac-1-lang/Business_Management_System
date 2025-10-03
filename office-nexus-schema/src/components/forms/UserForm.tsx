import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserService, User, UserRole, CreateUserRequest, UpdateUserRequest } from "@/services/userService";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
  isEdit?: boolean;
}

export function UserForm({ open, onClose, onSuccess, user, isEdit = false }: UserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    department: "",
    permissions: [] as string[],
    isActive: true
  });

  const departments = [
    "Human Resources",
    "Accounting",
    "Operations",
    "Management",
    "IT",
    "Legal",
    "Marketing",
    "Sales"
  ];

  useEffect(() => {
    if (open) {
      loadRoles();
      if (isEdit && user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
          role: user.role || "",
          phone: user.phone || "",
          department: user.department || "",
          permissions: user.permissions || [],
          isActive: user.isActive ?? true
        });
      } else {
        resetForm();
      }
    }
  }, [open, isEdit, user]);

  const loadRoles = async () => {
    try {
      const response = await UserService.getRoles();
      if (response.success && response.data) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      phone: "",
      department: "",
      permissions: [],
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      if (!isEdit && (!formData.password || formData.password !== formData.confirmPassword)) {
        toast({
          title: "Validation Error",
          description: !formData.password ? "Password is required" : "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      let response;
      if (isEdit && user) {
        const updateData: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          permissions: formData.permissions,
          isActive: formData.isActive
        };
        response = await UserService.updateUser(user.id, updateData);
      } else {
        const createData: CreateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
          permissions: formData.permissions
        };
        response = await UserService.createUser(createData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `User ${isEdit ? 'updated' : 'created'} successfully`
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEdit ? 'update' : 'create'} user`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} user:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${isEdit ? 'updating' : 'creating'} the user`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading || isEdit}
            />
          </div>

          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEdit}
                  disabled={loading}
                  minLength={8}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!isEdit}
                  disabled={loading}
                  minLength={8}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+250 7XX XXX XXX"
              disabled={loading}
            />
          </div>

          {selectedRole && selectedRole.permissions.length > 0 && selectedRole.id !== 'admin' && (
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {selectedRole.permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor={permission} className="text-sm">
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEdit && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                disabled={loading}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
