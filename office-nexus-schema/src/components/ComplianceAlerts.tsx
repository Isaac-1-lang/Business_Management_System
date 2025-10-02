
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, CheckCircle, Clock, X } from "lucide-react";
import { useState, useEffect } from "react";
import AlertService from "@/services/alertService";
import TaxService from "@/services/taxService";

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  dueDate?: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export function ComplianceAlerts() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceAlerts();
  }, []);

  const loadComplianceAlerts = async () => {
    try {
      const systemAlerts = AlertService.getAllAlerts();
      const taxSummary = await TaxService.getTaxSummary();
      
      // Create tax-related alerts
      const taxAlerts: ComplianceAlert[] = [];
      const currentDate = new Date();
      
      Object.entries(taxSummary.next_filing_dates).forEach(([taxType, date]) => {
        const dueDate = new Date(date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 30) {
          taxAlerts.push({
            id: `tax-${taxType}-${Date.now()}`,
            title: `${taxType.toUpperCase()} Filing Due`,
            description: `${taxType.toUpperCase()} return must be filed by ${dueDate.toLocaleDateString()}`,
            priority: daysUntilDue <= 7 ? 'high' : daysUntilDue <= 14 ? 'medium' : 'low',
            type: 'tax_filing',
            dueDate: date,
            status: 'active'
          });
        }
      });

      // Combine with system alerts
      const combinedAlerts = [
        ...taxAlerts,
        ...systemAlerts.map(alert => ({
          id: alert.id,
          title: alert.title,
          description: alert.description,
          priority: alert.severity,
          type: alert.type,
          dueDate: alert.dueDate,
          status: alert.status as 'active' | 'resolved' | 'dismissed'
        }))
      ].filter(alert => alert.status === 'active')
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5); // Show only top 5 alerts

      setAlerts(combinedAlerts);
    } catch (error) {
      console.error('Error loading compliance alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    // In real app, this would call AlertService.dismissAlert(alertId)
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    // In real app, this would call AlertService.resolveAlert(alertId)
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Compliance Alerts
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/compliance-alerts'}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No active compliance alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(alert.priority)}>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(alert.priority)}
                          {alert.priority.toUpperCase()}
                        </div>
                      </Badge>
                      {alert.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(alert.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
