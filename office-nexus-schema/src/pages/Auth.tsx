/**
 * AUTHENTICATION PAGE
 * 
 * A beautiful authentication page that:
 * - Switches between login and registration
 * - Provides a modern, responsive design
 * - Integrates with the auth context
 * - Handles navigation after successful auth
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Building, Users, Shield, TrendingUp } from 'lucide-react';

type AuthMode = 'login' | 'register';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12">
        <div className="max-w-md mx-auto flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Office Nexus
            </h1>
            <p className="text-xl text-blue-100">
              Complete business management solution for Rwanda
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Company Management</h3>
                <p className="text-blue-100">
                  Manage multiple companies, track compliance, and handle all business operations in one place.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">HR & Payroll</h3>
                <p className="text-blue-100">
                  Complete employee management, payroll processing, and HR compliance tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Tax & Compliance</h3>
                <p className="text-blue-100">
                  Automated tax calculations, VAT returns, and compliance deadline tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Financial Reports</h3>
                <p className="text-blue-100">
                  Comprehensive financial reporting, analytics, and business insights.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-blue-100">
              "Office Nexus has transformed how we manage our business. Everything is now streamlined and compliant."
            </p>
            <p className="text-xs text-blue-200 mt-2">- Tech Solutions Rwanda Ltd</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Office Nexus
            </h1>
            <p className="text-gray-600">
              Complete business management solution
            </p>
          </div>

          {/* Auth Form */}
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              🚀 Try the Demo
            </h3>
            <p className="text-xs text-blue-700 mb-2">
              Use these credentials to explore the system:
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p><strong>Admin:</strong> admin@test.com / Admin123!</p>
              <p><strong>Owner:</strong> john@test.com / John123!</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 Office Nexus. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

