
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsHeader from "@/components/reports/ReportsHeader";
import ReportMetrics from "@/components/reports/ReportMetrics";
import ReportCharts from "@/components/reports/ReportCharts";
import QuickReports from "@/components/reports/QuickReports";
import UpcomingDeadlines from "@/components/reports/UpcomingDeadlines";
import TrialBalance from "@/components/reports/TrialBalance";
import EnhancedPaymentMethodAnalytics from "@/components/reports/EnhancedPaymentMethodAnalytics";
import FinancialReportsPanel from "@/components/reports/FinancialReportsPanel";
import AuditLogsPanel from "@/components/reports/AuditLogsPanel";
import { ProductionReadinessDashboard } from "@/components/ProductionReadinessDashboard";
import TaxService from "@/services/taxService";

export default function ReportsAudit() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedRole, setSelectedRole] = useState("owner");

  // Get tax summary including QIT
  const taxSummary = TaxService.getTaxSummary();

  // Dashboard data - replace with actual data from API
  const dashboardData = {
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    activeEmployees: 0,
    payrollCost: 0,
    unpaidInvoices: 0,
    upcomingDeadlines: 0,
    complianceStatus: "unknown",
    // Enhanced tax obligations
    vatDue: taxSummary.vat_due,
    payeDue: taxSummary.paye_due,
    citDue: taxSummary.cit_due,
    qitDue: taxSummary.qit_due,
    totalTaxObligations: taxSummary.vat_due + taxSummary.paye_due + taxSummary.cit_due + taxSummary.qit_due
  };

  const revenueData = [];

  const expenseCategories = [];

  const upcomingDeadlines = [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ReportsHeader
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="financial-reports">Reports</TabsTrigger>
            <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Analytics</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Trail</TabsTrigger>
            <TabsTrigger value="system-status">System Status</TabsTrigger>
            <TabsTrigger value="quick-reports">Quick Reports</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <ReportMetrics dashboardData={dashboardData} />
            <ReportCharts 
              revenueData={revenueData} 
              expenseCategories={expenseCategories} 
            />
          </TabsContent>

          <TabsContent value="financial-reports">
            <FinancialReportsPanel />
          </TabsContent>

          <TabsContent value="trial-balance">
            <TrialBalance />
          </TabsContent>

          <TabsContent value="payment-methods">
            <EnhancedPaymentMethodAnalytics />
          </TabsContent>

          <TabsContent value="audit-logs">
            <AuditLogsPanel />
          </TabsContent>

          <TabsContent value="system-status">
            <ProductionReadinessDashboard />
          </TabsContent>

          <TabsContent value="quick-reports">
            <QuickReports />
          </TabsContent>

          <TabsContent value="deadlines">
            <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
