/**
 * LOGIN FORM COMPONENT
 * 
 * A modern, responsive login form with:
 * - Email and password validation
 * - Error handling and display
 * - Loading states
 * - Remember me functionality
 * - Integration with auth context
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, onSwitchToRegister, className }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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

    const success = await login({
      email: formData.email,
      password: formData.password,
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  // Handle demo login
  const handleDemoLogin = async () => {
    setFormData({
      email: 'admin@test.com',
      password: 'Admin123!',
      rememberMe: false,
    });

    const success = await login({
      email: 'admin@test.com',
      password: 'Admin123!',
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto bg-white border-blue-200', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-blue-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-blue-700">
          Enter your credentials to access your account
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

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-900 font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-900 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Label htmlFor="rememberMe" className="text-sm text-blue-900">
              Remember me
            </Label>
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Demo Login Button */}
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-blue-700">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
