import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, FileText, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UniversalTransactionHandler from "@/services/universalTransactionHandler";
import DataIntegrationService from "@/services/dataIntegrationService";
import AuditLogService from "@/services/auditLogService";

interface SystemCheck {
  component: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  last_checked: string;
}

export function ProductionReadinessDashboard() {
  const { toast } = useToast();
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<string | null>(null);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    setIsRunningChecks(true);
    const checks: SystemCheck[] = [];
    const checkTime = new Date().toISOString();

    try {
      // Check 1: Capital Management Integration
      try {
        const { default: CompanyCapitalService } = await import('@/services/companyCapitalService');
        const capitalSummary = CompanyCapitalService.getCapitalSummary();
        checks.push({
          component: 'Capital Management',
          status: capitalSummary.authorized_capital > 0 ? 'pass' : 'warning',
          message: capitalSummary.authorized_capital > 0 
            ? `Capital configured: ${capitalSummary.authorized_capital.toLocaleString()} RWF`
            : 'No company capital configured',
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Capital Management',
          status: 'fail',
          message: 'Capital service not accessible',
          last_checked: checkTime
        });
      }

      // Check 2: Shareholders Integration
      try {
        const directorsData = DataIntegrationService.getDirectorsData();
        const shareholdersWithShares = directorsData.filter((d: any) => parseFloat(d.shares || '0') > 0);
        checks.push({
          component: 'Shareholders Register',
          status: shareholdersWithShares.length > 0 ? 'pass' : 'warning',
          message: `${shareholdersWithShares.length} shareholders registered`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Shareholders Register',
          status: 'fail',
          message: 'Shareholders data not accessible',
          last_checked: checkTime
        });
      }

      // Check 3: Beneficial Ownership
      try {
        const { default: BeneficialOwnerService } = await import('@/services/beneficialOwnerService');
        const beneficialOwners = BeneficialOwnerService.getAllBeneficialOwners();
        const validation = BeneficialOwnerService.validateOwnershipPercentages();
        checks.push({
          component: 'Beneficial Ownership',
          status: validation.isValid ? 'pass' : 'warning',
          message: validation.isValid 
            ? `${beneficialOwners.length} beneficial owners registered`
            : `Issues: ${validation.violations.join(', ')}`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Beneficial Ownership',
          status: 'fail',
          message: 'Beneficial ownership service not accessible',
          last_checked: checkTime
        });
      }

      // Check 4: Dividend System
      try {
        const { default: DividendService } = await import('@/services/dividendService');
        const dividendSummary = DividendService.getDividendSummary();
        checks.push({
          component: 'Dividend Management',
          status: 'pass',
          message: `${dividendSummary.totalDeclarations} declarations, ${dividendSummary.totalPaid.toLocaleString()} RWF paid`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Dividend Management',
          status: 'fail',
          message: 'Dividend service not accessible',
          last_checked: checkTime
        });
      }

      // Check 5: Transaction Integration
      try {
        const transactionSummary = UniversalTransactionHandler.getTransactionSummary();
        checks.push({
          component: 'Transaction Processing',
          status: transactionSummary.total_transactions > 0 ? 'pass' : 'warning',
          message: `${transactionSummary.total_transactions} transactions processed`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Transaction Processing',
          status: 'fail',
          message: 'Transaction handler not accessible',
          last_checked: checkTime
        });
      }

      // Check 6: Accounting Integration
      try {
        const { default: TransactionEngine } = await import('@/services/transactionEngine');
        const generalLedger = TransactionEngine.getGeneralLedger();
        const trialBalance = TransactionEngine.getTrialBalance();
        checks.push({
          component: 'Accounting System',
          status: generalLedger.length > 0 ? 'pass' : 'warning',
          message: `${generalLedger.length} GL entries, ${trialBalance.length} accounts`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Accounting System',
          status: 'fail',
          message: 'Accounting engine not accessible',
          last_checked: checkTime
        });
      }

      // Check 7: Audit Logging
      try {
        const auditSummary = AuditLogService.getActivitySummary(7);
        checks.push({
          component: 'Audit Logging',
          status: auditSummary.totalActions > 0 ? 'pass' : 'warning',
          message: `${auditSummary.totalActions} audit entries in last 7 days`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Audit Logging',
          status: 'fail',
          message: 'Audit service not accessible',
          last_checked: checkTime
        });
      }

      // Check 8: Data Integration
      try {
        // Simple check - just verify service exists and data can be retrieved
        const directorsData = DataIntegrationService.getDirectorsData();
        checks.push({
          component: 'Data Integration',
          status: 'pass',
          message: `Integration active, ${directorsData.length} director records synced`,
          last_checked: checkTime
        });
      } catch (error) {
        checks.push({
          component: 'Data Integration',
          status: 'fail',
          message: 'Data integration service not accessible',
          last_checked: checkTime
        });
      }

      setSystemChecks(checks);
      setLastFullCheck(checkTime);

      // Show summary toast
      const passCount = checks.filter(c => c.status === 'pass').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;
      const failCount = checks.filter(c => c.status === 'fail').length;

      toast({
        title: "System Check Complete",
        description: `${passCount} passed, ${warningCount} warnings, ${failCount} failed`,
        variant: failCount > 0 ? "destructive" : warningCount > 0 ? "default" : "default"
      });

    } catch (error) {
      console.error('System check error:', error);
      toast({
        title: "System Check Failed",
        description: "Unable to complete full system check",
        variant: "destructive"
      });
    } finally {
      setIsRunningChecks(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>;
    }
  };

  const passCount = systemChecks.filter(c => c.status === 'pass').length;
  const warningCount = systemChecks.filter(c => c.status === 'warning').length;
  const failCount = systemChecks.filter(c => c.status === 'fail').length;
  const totalChecks = systemChecks.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Production Readiness Dashboard
          </CardTitle>
          <Button 
            onClick={runSystemChecks}
            disabled={isRunningChecks}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunningChecks ? 'animate-spin' : ''}`} />
            {isRunningChecks ? 'Checking...' : 'Run Checks'}
          </Button>
        </CardHeader>
        <CardContent>
          {lastFullCheck && (
            <div className="mb-4 text-sm text-gray-600">
              Last full check: {new Date(lastFullCheck).toLocaleString()}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{passCount}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{failCount}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{totalChecks}</div>
                    <div className="text-sm text-gray-600">Total Checks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Status Alert */}
          {failCount > 0 && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Issues Found:</strong> {failCount} system component(s) failed checks. 
                Immediate attention required before production deployment.
              </AlertDescription>
            </Alert>
          )}

          {warningCount > 0 && failCount === 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings Detected:</strong> {warningCount} component(s) have warnings. 
                Review and address before full production deployment.
              </AlertDescription>
            </Alert>
          )}

          {failCount === 0 && warningCount === 0 && totalChecks > 0 && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>System Ready:</strong> All components passed production readiness checks.
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Results */}
          <div className="space-y-3">
            {systemChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.component}</div>
                    <div className="text-sm text-gray-600">{check.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(check.status)}
                  <div className="text-xs text-gray-500">
                    {new Date(check.last_checked).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
