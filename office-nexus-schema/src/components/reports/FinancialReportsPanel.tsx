
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Building, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReportService from '@/services/reportService';
import ReportControls from './financial/ReportControls';
import ReportCard from './financial/ReportCard';

interface ReportCardData {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'financial' | 'tax' | 'compliance' | 'operational';
  generator: () => Promise<any>;
}

export default function FinancialReportsPanel() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const reportCards: ReportCardData[] = [
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'Monthly P&L, Assets, Liabilities overview',
      icon: TrendingUp,
      category: 'financial',
      generator: ReportService.generateFinancialSummary
    },
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      description: 'Complete trial balance with all accounts',
      icon: FileText,
      category: 'financial',
      generator: ReportService.generateFinancialSummary
    },
    {
      id: 'payroll-report',
      title: 'Payroll Summary',
      description: 'Employee salaries, taxes, and deductions',
      icon: DollarSign,
      category: 'operational',
      generator: ReportService.generatePayrollReport
    },
    {
      id: 'vat-report',
      title: 'Tax Filing Bundle',
      description: 'VAT, PAYE, CIT, and QIT reports',
      icon: FileText,
      category: 'tax',
      generator: ReportService.generateVATReport
    },
    {
      id: 'capital-report',
      title: 'Capital Structure',
      description: 'Share capital, contributions, and ownership',
      icon: Building,
      category: 'compliance',
      generator: ReportService.generateCapitalReport
    },
    {
      id: 'dividend-report',
      title: 'Dividend Distribution',
      description: 'Profit sharing and dividend declarations',
      icon: DollarSign,
      category: 'compliance',
      generator: ReportService.generateDividendReport
    },
    {
      id: 'beneficial-ownership',
      title: 'Beneficial Ownership',
      description: 'Ultimate beneficial owners register',
      icon: FileText,
      category: 'compliance',
      generator: ReportService.generateBeneficialOwnershipReport
    },
    {
      id: 'compliance-status',
      title: 'Compliance Dashboard',
      description: 'Overall compliance status and alerts',
      icon: FileText,
      category: 'compliance',
      generator: ReportService.generateComplianceStatus
    }
  ];

  const generateReport = async (report: ReportCardData) => {
    setIsGenerating(report.id);
    try {
      const reportData = await report.generator();
      await ReportService.generatePDF(reportData);
      
      toast({
        title: "Report Generated",
        description: `${report.title} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const generateAllReports = async () => {
    setIsGenerating('all');
    try {
      for (const report of reportCards) {
        await report.generator();
      }
      toast({
        title: "All Reports Generated",
        description: "Complete report bundle has been created",
      });
    } catch (error) {
      toast({
        title: "Bulk Generation Failed",
        description: "Some reports may not have been generated",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <ReportControls
        dateRange={dateRange}
        setDateRange={setDateRange}
        onGenerateAll={generateAllReports}
        isGenerating={isGenerating === 'all'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report) => (
          <ReportCard
            key={report.id}
            {...report}
            isGenerating={isGenerating === report.id}
            onGenerate={() => generateReport(report)}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Period: {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
            </div>
            <div>Reports will include data from the selected date range. For compliance reports, the most recent data will be used regardless of date range.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
