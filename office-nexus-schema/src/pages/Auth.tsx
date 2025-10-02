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
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    navigate('/');
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
              Intego Office 
            </h1>
            <p className="text-xl text-blue-100">
            Igisubizo cyuzuye cyo gucunga imishinga y' Abanyarwanda
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Gucunga imishinga</h3>
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
                <h3 className="text-lg font-semibold mb-2">Kubera k'impinduka</h3>
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
                <h3 className="text-lg font-semibold mb-2">Z' imibare gusubiramo</h3>
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
                <h3 className="text-lg font-semibold mb-2">
                Raporo y’imari</h3>
                <p className="text-blue-100">
                Raporo yimari yuzuye, isesengura, nubushishozi bwubucuruzi.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-blue-100">
              "Intego Office yahinduye uburyo ducunga ibikorwa byacu. Ibintu byose ubu byoroheje kandi byujuje ibisabwa."
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Intego Office
            </h1>
            <p className="text-blue-700">
            Igisubizo cyuzuye cyo gucunga imishinga y' Abanyarwanda
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

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-blue-600">
              © 2024 Intego Office. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

