
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
  private static alerts: Alert[] = [
    {
      id: '1',
      title: 'VAT Return Due Soon',
      description: 'VAT return filing due in 3 days (July 15, 2024)',
      type: 'tax',
      severity: 'high',
      status: 'active',
      alertDate: '2024-07-12',
      dueDate: '2024-07-15',
      forRole: ['admin', 'accountant'],
      isRead: false,
      createdAt: '2024-07-12 09:00',
      source: 'auto',
      actionRequired: 'File VAT Return',
      relatedEntity: {
        type: 'tax_return',
        id: 'vat_2024_q2',
        name: 'Q2 2024 VAT Return'
      }
    },
    {
      id: '2',
      title: 'Employee Contract Expiring',
      description: 'John Doe\'s employment contract expires in 15 days',
      type: 'hr',
      severity: 'medium',
      status: 'active',
      alertDate: '2024-07-11',
      dueDate: '2024-07-26',
      forRole: ['admin', 'hr'],
      isRead: false,
      createdAt: '2024-07-11 14:30',
      source: 'auto',
      actionRequired: 'Renew or Terminate Contract',
      relatedEntity: {
        type: 'employee',
        id: 'emp_001',
        name: 'John Doe'
      }
    },
    {
      id: '3',
      title: 'Business License Renewal',
      description: 'Business license expires in 30 days',
      type: 'license',
      severity: 'medium',
      status: 'acknowledged',
      alertDate: '2024-07-10',
      dueDate: '2024-08-10',
      forRole: ['admin', 'legal'],
      isRead: true,
      createdAt: '2024-07-10 11:15',
      source: 'auto',
      actionRequired: 'Renew Business License'
    },
    {
      id: '4',
      title: 'RDB Annual Return',
      description: 'Annual return submission due in 45 days',
      type: 'compliance',
      severity: 'low',
      status: 'active',
      alertDate: '2024-07-09',
      dueDate: '2024-08-23',
      forRole: ['admin', 'legal'],
      isRead: false,
      createdAt: '2024-07-09 08:00',
      source: 'auto',
      actionRequired: 'Submit Annual Return'
    },
    {
      id: '5',
      title: 'Monthly Payroll Processing',
      description: 'Payroll for July 2024 needs to be processed',
      type: 'hr',
      severity: 'high',
      status: 'resolved',
      alertDate: '2024-07-08',
      dueDate: '2024-07-25',
      forRole: ['admin', 'hr', 'accountant'],
      isRead: true,
      createdAt: '2024-07-08 16:00',
      source: 'auto',
      actionRequired: 'Process Payroll'
    },
    {
      id: '6',
      title: 'Board Meeting Preparation',
      description: 'Prepare documents for quarterly board meeting',
      type: 'custom',
      severity: 'medium',
      status: 'active',
      alertDate: '2024-07-07',
      dueDate: '2024-07-20',
      forRole: ['admin', 'legal'],
      isRead: false,
      createdBy: 'admin',
      createdAt: '2024-07-07 10:30',
      source: 'manual',
      actionRequired: 'Prepare Meeting Documents'
    }
  ];

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
