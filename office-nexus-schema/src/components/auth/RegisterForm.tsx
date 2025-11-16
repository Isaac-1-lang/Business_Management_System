/**
 * REGISTER FORM COMPONENT
 * 
 * A comprehensive registration form with:
 * - Full user information collection
 * - Password strength validation
 * - Email verification
 * - Company association
 * - Integration with auth context
 * - All registered users become owners by default
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

// All registered users will be owners by default
// Role selection removed - users can create other roles later from the main app

export function RegisterForm({ onSuccess, onSwitchToLogin, className }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Company creation fields
    companyName: '',
    companyTin: '',
    createCompany: true, // Default to creating a company
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

    // Company validation (if creating company)
    if (formData.createCompany) {
      if (!formData.companyName.trim()) {
        errors.companyName = 'Company name is required';
      } else if (formData.companyName.length < 2) {
        errors.companyName = 'Company name must be at least 2 characters';
      }
      
      if (formData.companyTin && formData.companyTin.length < 5) {
        errors.companyTin = 'TIN must be at least 5 characters';
      }
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

    const registerData: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      phone: formData.phone || undefined,
      // Role is automatically set to 'owner' on the backend
    };

    // Include company data if creating a company
    if (formData.createCompany && formData.companyName.trim()) {
      registerData.company = {
        name: formData.companyName.trim(),
        tin: formData.companyTin.trim() || undefined,
      };
    }

    console.log('Registering with data:', {
      ...registerData,
      password: '***hidden***' // Don't log password
    });

    try {
      const success = await register(registerData);

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Error is already handled in AuthContext, but we can add additional handling here if needed
      console.error('Registration error:', error);
    }
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto bg-white border-blue-200', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-blue-900">
          Create Owner Account
        </CardTitle>
        <CardDescription className="text-center text-blue-700">
          Enter your information to create your business owner account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-blue-900 font-medium">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={cn(
                    'pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
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
              <Label htmlFor="lastName" className="text-blue-900 font-medium">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={cn(
                  'border-blue-200 focus:border-blue-500 focus:ring-blue-500',
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
            <Label htmlFor="email" className="text-blue-900 font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
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
            <Label htmlFor="phone" className="text-blue-900 font-medium">Phone (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
                  validationErrors.phone && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-sm text-red-500">{validationErrors.phone}</p>
            )}
          </div>

          {/* Company Creation Section */}
          {formData.createCompany && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-blue-900 font-medium">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Your Company Name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={cn(
                      'pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
                      validationErrors.companyName && 'border-red-500 focus:border-red-500'
                    )}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.companyName && (
                  <p className="text-sm text-red-500">{validationErrors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyTin" className="text-blue-900 font-medium">
                  Company TIN (Optional)
                </Label>
                <Input
                  id="companyTin"
                  name="companyTin"
                  type="text"
                  placeholder="Tax Identification Number"
                  value={formData.companyTin}
                  onChange={handleInputChange}
                  className={cn(
                    'border-blue-200 focus:border-blue-500 focus:ring-blue-500',
                    validationErrors.companyTin && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={isLoading}
                />
                {validationErrors.companyTin && (
                  <p className="text-sm text-red-500">{validationErrors.companyTin}</p>
                )}
              </div>
            </>
          )}

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-900 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
                  validationErrors.password && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-500 hover:text-blue-700"
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
              <p className="text-sm text-green-600">✓ Password is strong</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-blue-900 font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={cn(
                  'pl-10 pr-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500',
                  validationErrors.confirmPassword && 'border-red-500 focus:border-red-500'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-blue-500 hover:text-blue-700"
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
              <p className="text-sm text-green-600">✓ Passwords match</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating owner account...
              </>
            ) : (
              'Create Owner Account'
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-700">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
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

