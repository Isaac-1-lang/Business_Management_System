/**
 * MAIN DASHBOARD PAGE - Index.tsx
 * 
 * This is the home/dashboard page that users see when they first log in.
 * It provides an overview of the entire system with key metrics and quick access.
 * 
 * PAGE STRUCTURE:
 * 1. Header with company selector and sidebar toggle
 * 2. Two main tabs: Business Overview and System Health
 * 3. Business Overview tab shows key business metrics
 * 4. System Health tab shows technical system status
 * 
 * COMPONENTS USED:
 * - AppSidebar: Main navigation sidebar
 * - DashboardHeader: Page title and breadcrumbs
 * - CompanySelector: Dropdown to switch between companies
 * - EmployeeOverview: Employee count and HR metrics
 * - FinancialActivity: Financial performance indicators
 * - ComplianceOverview: Compliance status and alerts
 * - ComplianceAlerts: Active compliance warnings
 * - QuickActions: Common task shortcuts
 * - RecentTransactions: Latest system activities
 * - SystemHealthDashboard: Technical system metrics
 * 
 * TO MODIFY THIS PAGE:
 * 1. Add new components to the appropriate tab sections
 * 2. Modify the grid layouts (grid-cols-1 lg:grid-cols-3, etc.)
 * 3. Add new tabs by extending the Tabs component
 * 4. Import and use components from /src/components/
 * 
 * TO ADD NEW METRICS:
 * 1. Create a new component in /src/components/
 * 2. Import it here
 * 3. Place it in the appropriate grid section
 * 4. Style it to match the existing design
 */

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { EmployeeOverview } from "@/components/EmployeeOverview";
import { FinancialActivity } from "@/components/FinancialActivity";
import { ComplianceAlerts } from "@/components/ComplianceAlerts";
import { ComplianceOverview } from "@/components/ComplianceOverview";
import { QuickActions } from "@/components/QuickActions";
import { RecentTransactions } from "@/components/RecentTransactions";
import SystemHealthDashboard from "@/components/SystemHealthDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySelector from "@/components/CompanySelector";

const Index = () => {
  return (
    // Wrap the entire page with sidebar context
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Left sidebar navigation */}
        <AppSidebar />
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          {/* Top header bar with navigation controls and company selector */}
          <div className="flex items-center justify-between gap-4 p-6 bg-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              {/* Mobile sidebar toggle button */}
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              {/* Page title and breadcrumbs */}
              <DashboardHeader />
            </div>
            {/* Company selection dropdown */}
            <CompanySelector />
          </div>
          
          {/* Main content area with tabs */}
          <div className="flex-1 p-8">
            {/* Tab navigation for different dashboard views */}
            <Tabs defaultValue="overview" className="space-y-8">
              {/* Tab navigation buttons */}
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="overview">Business Overview</TabsTrigger>
                <TabsTrigger value="system">System Health</TabsTrigger>
              </TabsList>

              {/* Business Overview Tab - Main dashboard content */}
              <TabsContent value="overview" className="space-y-8">
                {/* Top Row - Key Business Metrics (3 columns on large screens) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Employee statistics and HR overview */}
                  <EmployeeOverview />
                  {/* Financial performance indicators */}
                  <FinancialActivity />
                  {/* Compliance status and requirements */}
                  <ComplianceOverview />
                </div>

                {/* Middle Row - Alerts and Quick Actions (2 columns on large screens) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Active compliance warnings and alerts */}
                  <ComplianceAlerts />
                  {/* Common task shortcuts and actions */}
                  <QuickActions />
                </div>

                {/* Bottom Row - Recent Activity (full width) */}
                <RecentTransactions />
              </TabsContent>

              {/* System Health Tab - Technical system monitoring */}
              <TabsContent value="system">
                {/* System performance, uptime, and technical metrics */}
                <SystemHealthDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
