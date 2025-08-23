
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';
import AuditLogService from '@/services/auditLogService';
import TransactionEngine from '@/services/transactionEngine';

interface SystemMetrics {
  totalTransactions: number;
  activeUsers: number;
  systemUptime: number;
  dataIntegrity: number;
  complianceScore: number;
  auditTrailHealth: number;
}

export default function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTransactions: 0,
    activeUsers: 0,
    systemUptime: 99.9,
    dataIntegrity: 100,
    complianceScore: 87.5,
    auditTrailHealth: 95.2
  });

  const [auditSummary, setAuditSummary] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = () => {
    // Get audit summary
    const summary = AuditLogService.getActivitySummary();
    setAuditSummary(summary);

    // Get recent activity
    const activity = AuditLogService.getRecentActivity(5);
    setRecentActivity(activity);

    // Calculate system metrics
    const generalLedger = TransactionEngine.getGeneralLedger();
    setMetrics(prev => ({
      ...prev,
      totalTransactions: generalLedger.length,
      activeUsers: summary.activeUsers.length
    }));
  };

  const getHealthStatus = (score: number) => {
    if (score >= 95) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 85) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{auditSummary.totalActions || 0}</div>
                <div className="text-sm text-gray-600">Audit Entries</div>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.systemUptime}%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Integrity</span>
                <span className="text-sm font-semibold">{metrics.dataIntegrity}%</span>
              </div>
              <Progress value={metrics.dataIntegrity} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Compliance Score</span>
                <span className="text-sm font-semibold">{metrics.complianceScore}%</span>
              </div>
              <Progress value={metrics.complianceScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Audit Trail Health</span>
                <span className="text-sm font-semibold">{metrics.auditTrailHealth}%</span>
              </div>
              <Progress value={metrics.auditTrailHealth} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm font-semibold">{metrics.systemUptime}%</span>
              </div>
              <Progress value={metrics.systemUptime} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        activity.action_type === 'create' ? 'bg-green-100' :
                        activity.action_type === 'update' ? 'bg-blue-100' :
                        activity.action_type === 'delete' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.action_type === 'create' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {activity.action_type === 'update' && <Clock className="w-4 h-4 text-blue-600" />}
                        {activity.action_type === 'delete' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {!['create', 'update', 'delete'].includes(activity.action_type) && <Activity className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activity.description}</div>
                        <div className="text-xs text-gray-500">{activity.user_name}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.table_name}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.complianceScore < 90 && (
              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Compliance Score Below Optimal</div>
                    <div className="text-sm text-gray-600">Review compliance requirements and update documentation</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            )}

            {metrics.auditTrailHealth < 95 && (
              <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Audit Trail Needs Attention</div>
                    <div className="text-sm text-gray-600">Some audit entries may be incomplete or missing</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Investigate
                </Button>
              </div>
            )}

            {auditSummary.totalActions > 0 && (
              <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">System Operating Normally</div>
                    <div className="text-sm text-gray-600">All systems are functioning within normal parameters</div>
                  </div>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
