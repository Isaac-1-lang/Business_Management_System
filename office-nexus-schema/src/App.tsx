/**
 * MAIN APP COMPONENT - office-nexus-schema
 * 
 * This is the root component that:
 * 1. Sets up React Router for navigation between pages
 * 2. Configures React Query for data fetching
 * 3. Defines all application routes
 * 4. Wraps the app with necessary providers
 * 
 * PROJECT STRUCTURE:
 * - /src/pages/ - Contains all page components
 * - /src/components/ - Reusable UI components
 * - /src/services/ - API and business logic services
 * - /src/hooks/ - Custom React hooks
 * - /src/lib/ - Utility functions and configurations
 * 
 * TO ADD A NEW PAGE:
 * 1. Create a new component in /src/pages/
 * 2. Import it here
 * 3. Add a new Route with appropriate path
 * 4. Add navigation link in AppSidebar.tsx
 * 
 * TO START DEVELOPMENT:
 * 1. This file shows all available routes
 * 2. Each route corresponds to a page component
 * 3. Modify existing pages or add new ones as needed
 * 4. Use the sidebar navigation to move between sections
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { DataSyncNotification } from "@/components/DataSyncNotification"
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import all page components
// These are the main views of the application
import Index from './pages/Index';
import CompanyProfile from './pages/CompanyProfile';
import DirectorsShareholders from './pages/DirectorsShareholders';
import EmployeeRecords from './pages/EmployeeRecords';
import PayrollHR from './pages/PayrollHR';
import InvoicesReceipts from './pages/InvoicesReceipts';
import AccountingBooks from './pages/AccountingBooks';
import GeneralLedger from './pages/GeneralLedger';
import TrialBalance from './pages/TrialBalance';
import FixedAssets from './pages/FixedAssets';
import ClientSupplierRegisters from './pages/ClientSupplierRegisters';
import ContractsAgreements from './pages/ContractsAgreements';
import MeetingMinutes from './pages/MeetingMinutes';
import DocumentVault from './pages/DocumentVault';
import TaxReturns from './pages/TaxReturns';
import ComplianceCalendar from './pages/ComplianceCalendar';
import ComplianceAlerts from './pages/ComplianceAlerts';
import ReportsAudit from './pages/ReportsAudit';
import InternalAuditReports from './pages/InternalAuditReports';
import BusinessPlan from './pages/BusinessPlan';
import ComplaintRiskManagement from './pages/ComplaintRiskManagement';
import Registers from './pages/Registers';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import CapitalEquity from "./pages/CapitalEquity";
import { Auth } from './pages/Auth';

// Initialize React Query client for data fetching and caching
// This enables efficient API calls and state management
const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Main App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Global toast notifications */}
      <Toaster />
      {/* Data synchronization status indicator */}
      <DataSyncNotification />
      
      {/* Define all application routes */}
      <Routes>
        {/* Authentication */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        
        {/* Company Management Section */}
        <Route path="/company-profile" element={
          <ProtectedRoute>
            <CompanyProfile />
          </ProtectedRoute>
        } />
        <Route path="/directors-shareholders" element={
          <ProtectedRoute>
            <DirectorsShareholders />
          </ProtectedRoute>
        } />
        <Route path="/capital-equity" element={
          <ProtectedRoute>
            <CapitalEquity />
          </ProtectedRoute>
        } />
        
        {/* HR & Employee Management */}
        <Route path="/employee-records" element={
          <ProtectedRoute>
            <EmployeeRecords />
          </ProtectedRoute>
        } />
        <Route path="/payroll-hr" element={
          <ProtectedRoute>
            <PayrollHR />
          </ProtectedRoute>
        } />
        
        {/* Financial & Accounting */}
        <Route path="/invoices-receipts" element={
          <ProtectedRoute>
            <InvoicesReceipts />
          </ProtectedRoute>
        } />
        <Route path="/accounting-books" element={
          <ProtectedRoute>
            <AccountingBooks />
          </ProtectedRoute>
        } />
        <Route path="/general-ledger" element={
          <ProtectedRoute>
            <GeneralLedger />
          </ProtectedRoute>
        } />
        <Route path="/trial-balance" element={
          <ProtectedRoute>
            <TrialBalance />
          </ProtectedRoute>
        } />
        <Route path="/fixed-assets" element={
          <ProtectedRoute>
            <FixedAssets />
          </ProtectedRoute>
        } />
        
        {/* Business Operations */}
        <Route path="/client-supplier-registers" element={
          <ProtectedRoute>
            <ClientSupplierRegisters />
          </ProtectedRoute>
        } />
        <Route path="/contracts-agreements" element={
          <ProtectedRoute>
            <ContractsAgreements />
          </ProtectedRoute>
        } />
        <Route path="/meeting-minutes" element={
          <ProtectedRoute>
            <MeetingMinutes />
          </ProtectedRoute>
        } />
        <Route path="/document-vault" element={
          <ProtectedRoute>
            <DocumentVault />
          </ProtectedRoute>
        } />
        
        {/* Compliance & Legal */}
        <Route path="/tax-returns" element={
          <ProtectedRoute>
            <TaxReturns />
          </ProtectedRoute>
        } />
        <Route path="/compliance-calendar" element={
          <ProtectedRoute>
            <ComplianceCalendar />
          </ProtectedRoute>
        } />
        <Route path="/compliance-alerts" element={
          <ProtectedRoute>
            <ComplianceAlerts />
          </ProtectedRoute>
        } />
        <Route path="/reports-audit" element={
          <ProtectedRoute>
            <ReportsAudit />
          </ProtectedRoute>
        } />
        <Route path="/internal-audit-reports" element={
          <ProtectedRoute>
            <InternalAuditReports />
          </ProtectedRoute>
        } />
        
        {/* Strategic Planning */}
        <Route path="/business-plan" element={
          <ProtectedRoute>
            <BusinessPlan />
          </ProtectedRoute>
        } />
        <Route path="/complaint-risk-management" element={
          <ProtectedRoute>
            <ComplaintRiskManagement />
          </ProtectedRoute>
        } />
        
        {/* System & Administration */}
        <Route path="/registers" element={
          <ProtectedRoute>
            <Registers />
          </ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } />
        
        {/* 404 page for unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    // Wrap the entire app with providers
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
