
export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'tax' | 'hr' | 'compliance' | 'financial' | 'license' | 'custom';
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved' | 'snoozed';
  alertDate: string;
  dueDate: string;
  forRole: string[];
  isRead: boolean;
  createdBy?: string;
  createdAt: string;
  source: 'auto' | 'manual';
  actionRequired?: string;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  highPriority: number;
}

class AlertService {
  // Empty array - replace with actual API calls in production
  private static alerts: Alert[] = [];

  static getAllAlerts(): Alert[] {
    return this.alerts;
  }

  static getAlertsByRole(role: string): Alert[] {
    return this.alerts.filter(alert => 
      alert.forRole.includes(role) || alert.forRole.includes('admin')
    );
  }

  static getAlertStats(): AlertStats {
    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => a.status === 'active').length,
      acknowledged: this.alerts.filter(a => a.status === 'acknowledged').length,
      resolved: this.alerts.filter(a => a.status === 'resolved').length,
      highPriority: this.alerts.filter(a => a.severity === 'high' && a.status === 'active').length
    };
  }

  static acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && alert.status === 'active') {
      alert.status = 'acknowledged';
      alert.isRead = true;
    }
  }

  static resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.isRead = true;
    }
  }

  static snoozeAlert(alertId: string, snoozeUntil: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'snoozed';
      alert.alertDate = snoozeUntil;
    }
  }

  static createManualAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'source'>): Alert {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      source: 'manual'
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  static filterAlerts(filters: {
    type?: string;
    severity?: string;
    status?: string;
    dateRange?: { from: string; to: string };
  }): Alert[] {
    let filtered = this.alerts;

    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }
    if (filters.severity) {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }
    if (filters.dateRange) {
      filtered = filtered.filter(a => 
        a.dueDate >= filters.dateRange!.from && 
        a.dueDate <= filters.dateRange!.to
      );
    }

    return filtered;
  }

  static getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getUnreadCount(): number {
    return this.alerts.filter(a => !a.isRead && a.status === 'active').length;
  }
}

export default AlertService;
