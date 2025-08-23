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
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { DataSyncNotification } from "@/components/DataSyncNotification"

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

// Initialize React Query client for data fetching and caching
// This enables efficient API calls and state management
const queryClient = new QueryClient();

function App() {
  return (
    // Wrap the entire app with React Query provider for data management
    <QueryClientProvider client={queryClient}>
      {/* Set up React Router for navigation between pages */}
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          {/* Global toast notifications */}
          <Toaster />
          {/* Data synchronization status indicator */}
          <DataSyncNotification />
          
          {/* Define all application routes */}
          <Routes>
            {/* Dashboard/Home page */}
            <Route path="/" element={<Index />} />
            
            {/* Company Management Section */}
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/directors-shareholders" element={<DirectorsShareholders />} />
            <Route path="/capital-equity" element={<CapitalEquity />} />
            
            {/* HR & Employee Management */}
            <Route path="/employee-records" element={<EmployeeRecords />} />
            <Route path="/payroll-hr" element={<PayrollHR />} />
            
            {/* Financial & Accounting */}
            <Route path="/invoices-receipts" element={<InvoicesReceipts />} />
            <Route path="/accounting-books" element={<AccountingBooks />} />
            <Route path="/general-ledger" element={<GeneralLedger />} />
            <Route path="/trial-balance" element={<TrialBalance />} />
            <Route path="/fixed-assets" element={<FixedAssets />} />
            
            {/* Business Operations */}
            <Route path="/client-supplier-registers" element={<ClientSupplierRegisters />} />
            <Route path="/contracts-agreements" element={<ContractsAgreements />} />
            <Route path="/meeting-minutes" element={<MeetingMinutes />} />
            <Route path="/document-vault" element={<DocumentVault />} />
            
            {/* Compliance & Legal */}
            <Route path="/tax-returns" element={<TaxReturns />} />
            <Route path="/compliance-calendar" element={<ComplianceCalendar />} />
            <Route path="/compliance-alerts" element={<ComplianceAlerts />} />
            <Route path="/reports-audit" element={<ReportsAudit />} />
            <Route path="/internal-audit-reports" element={<InternalAuditReports />} />
            
            {/* Strategic Planning */}
            <Route path="/business-plan" element={<BusinessPlan />} />
            <Route path="/complaint-risk-management" element={<ComplaintRiskManagement />} />
            
            {/* System & Administration */}
            <Route path="/registers" element={<Registers />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            
            {/* 404 page for unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
