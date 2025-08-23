
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

  // Sample data for dashboard widgets with enhanced tax data
  const dashboardData = {
    totalRevenue: 45000000,
    totalExpenses: 32000000,
    profit: 13000000,
    activeEmployees: 25,
    payrollCost: 18500000,
    unpaidInvoices: 8,
    upcomingDeadlines: 3,
    complianceStatus: "good",
    // Enhanced tax obligations
    vatDue: taxSummary.vat_due,
    payeDue: taxSummary.paye_due,
    citDue: taxSummary.cit_due,
    qitDue: taxSummary.qit_due,
    totalTaxObligations: taxSummary.vat_due + taxSummary.paye_due + taxSummary.cit_due + taxSummary.qit_due
  };

  const revenueData = [
    { month: "Jan", revenue: 3500000, expenses: 2800000 },
    { month: "Feb", revenue: 4200000, expenses: 3100000 },
    { month: "Mar", revenue: 3800000, expenses: 2900000 },
    { month: "Apr", revenue: 4500000, expenses: 3200000 },
    { month: "May", revenue: 4100000, expenses: 3000000 },
    { month: "Jun", revenue: 4800000, expenses: 3400000 }
  ];

  const expenseCategories = [
    { name: "Salaries", value: 18500000, color: "#8884d8" },
    { name: "Rent", value: 4800000, color: "#82ca9d" },
    { name: "Utilities", value: 2400000, color: "#ffc658" },
    { name: "Marketing", value: 3600000, color: "#ff7300" },
    { name: "Other", value: 2700000, color: "#8dd1e1" }
  ];

  const upcomingDeadlines = [
    { task: "VAT Return Filing", dueDate: taxSummary.next_filing_dates.vat, priority: "high", department: "Finance" },
    { task: "PAYE Returns", dueDate: taxSummary.next_filing_dates.paye, priority: "medium", department: "HR" },
    { task: "QIT Payment", dueDate: taxSummary.next_filing_dates.qit, priority: "high", department: "Finance" },
    { task: "Annual CIT Filing", dueDate: taxSummary.next_filing_dates.cit, priority: "medium", department: "Finance" }
  ];

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
