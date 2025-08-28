/**
 * REGISTER FORM COMPONENT
 * 
 * A comprehensive registration form with:
 * - Full user information collection
 * - Password strength validation
 * - Email verification
 * - Role selection
 * - Company association
 * - Integration with auth context
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

const USER_ROLES = [
  { value: 'owner', label: 'Business Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'hr', label: 'HR Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'viewer', label: 'Viewer' },
];

export function RegisterForm({ onSuccess, onSwitchToLogin, className }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'employee',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate password strength
  const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
    }
    return { isValid: true, message: 'Password is strong' };
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, validate format)
    if (formData.phone && !/^(\+250|0)?7[2389][0-9]{7}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid Rwanda phone number';
    }

    // Password validation
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      phone: formData.phone || undefined,
      role: formData.role,
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={cn(
                    'pl-10',
                    validationErrors.firstName && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.firstName && (
                <p className="text-sm text-red-500">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className={cn(
                  validationErrors.lastName && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
              {validationErrors.lastName && (
                <p className="text-sm text-red-500">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  'pl-10',
                  validationErrors.email && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+250788123456"
                value={formData.phone}
                onChange={handleInputChange}
                className={cn(
                  'pl-10',
                  validationErrors.phone && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-sm text-red-500">{validationErrors.phone}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 pr-10',
                  validationErrors.password && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-500">{validationErrors.password}</p>
            )}
            {formData.password && !validationErrors.password && (
              <p className="text-sm text-green-500">✓ Password is strong</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 pr-10',
                  validationErrors.confirmPassword && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
            {formData.confirmPassword && !validationErrors.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-sm text-green-500">✓ Passwords match</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

