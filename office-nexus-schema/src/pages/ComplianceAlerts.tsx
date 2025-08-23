import { useState } from "react";
import { ArrowLeft, Bell, AlertTriangle, CheckCircle, XCircle, Filter, Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AlertService, { Alert } from "@/services/alertService";
import ManualAlertForm from "@/components/forms/ManualAlertForm";

export default function ComplianceAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(AlertService.getAllAlerts());
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [isManualAlertOpen, setIsManualAlertOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all',
    role: 'admin' // Current user role
  });

  const stats = AlertService.getAlertStats();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800";
      case "acknowledged": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "snoozed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tax": return <AlertTriangle className="w-4 h-4" />;
      case "hr": return <XCircle className="w-4 h-4" />;
      case "compliance": return <CheckCircle className="w-4 h-4" />;
      case "financial": return <Bell className="w-4 h-4" />;
      case "license": return <Bell className="w-4 h-4" />;
      case "custom": return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string): string => {
    const days = AlertService.getDaysUntilDue(dueDate);
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `${days} days left`;
  };

  const getDaysColor = (dueDate: string): string => {
    const days = AlertService.getDaysUntilDue(dueDate);
    if (days < 0) return "text-red-600 font-semibold";
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-yellow-600";
    return "text-gray-600";
  };

  const handleAcknowledge = (alertId: string) => {
    AlertService.acknowledgeAlert(alertId);
    setAlerts([...AlertService.getAllAlerts()]);
    applyFilters();
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged"
    });
  };

  const handleResolve = (alertId: string) => {
    AlertService.resolveAlert(alertId);
    setAlerts([...AlertService.getAllAlerts()]);
    applyFilters();
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved"
    });
  };

  const handleSnooze = (alertId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    AlertService.snoozeAlert(alertId, tomorrow.toISOString().split('T')[0]);
    setAlerts([...AlertService.getAllAlerts()]);
    applyFilters();
    toast({
      title: "Alert Snoozed",
      description: "Alert has been snoozed until tomorrow"
    });
  };

  const applyFilters = () => {
    let filtered = AlertService.getAlertsByRole(filters.role);
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(a => a.type === filters.type);
    }
    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    setFilteredAlerts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      severity: 'all',
      status: 'all',
      role: 'admin'
    });
    setFilteredAlerts(AlertService.getAlertsByRole('admin'));
  };

  const handleManualAlertCreated = (alert: Alert) => {
    setAlerts([...AlertService.getAllAlerts()]);
    applyFilters();
    toast({
      title: "Alert Created",
      description: "Manual alert has been created successfully"
    });
  };

  // Apply filters when filter state changes
  useState(() => {
    applyFilters();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Alert Center</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={() => setIsManualAlertOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</div>
              <div className="text-sm text-gray-600">Acknowledged</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-500">{stats.highPriority}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tax">Tax</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="snoozed">Snoozed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Role View</label>
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={applyFilters} className="mt-4">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Alert Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Center ({filteredAlerts.length} alerts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className={!alert.isRead ? "bg-blue-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-gray-600">{alert.description}</div>
                        {alert.actionRequired && (
                          <div className="text-xs text-blue-600 mt-1">
                            Action: {alert.actionRequired}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{alert.dueDate}</div>
                        <div className={`text-xs ${getDaysColor(alert.dueDate)}`}>
                          {getDaysUntilDue(alert.dueDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={alert.source === 'auto' ? 'bg-green-50' : 'bg-blue-50'}>
                        {alert.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {alert.status === "active" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSnooze(alert.id)}
                            >
                              <Clock className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {alert.status === "acknowledged" && (
                          <Button 
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                        {alert.status === "resolved" && (
                          <Badge variant="outline">Completed</Badge>
                        )}
                        {alert.status === "snoozed" && (
                          <Badge variant="outline" className="bg-purple-50">
                            <Clock className="w-3 h-3 mr-1" />
                            Snoozed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ManualAlertForm
          open={isManualAlertOpen}
          onClose={() => setIsManualAlertOpen(false)}
          onAlertCreated={handleManualAlertCreated}
        />
      </div>
    </div>
  );
}
