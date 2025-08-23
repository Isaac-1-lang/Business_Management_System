
export interface AuditLog {
  id: string;
  action_type: 'create' | 'update' | 'delete' | 'view' | 'export' | 'sync';
  table_name: string;
  record_id: string;
  changed_by: string;
  user_name: string;
  old_data?: any;
  new_data?: any;
  description: string;
  ip_address?: string;
  changed_at: string;
}

class AuditLogService {
  private static auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      action_type: 'create',
      table_name: 'transactions',
      record_id: 'TXN-001',
      changed_by: 'user-1',
      user_name: 'John Doe',
      new_data: { amount: 1500000, type: 'sale' },
      description: 'Created sales transaction',
      changed_at: '2024-06-15T10:30:00Z'
    },
    {
      id: 'audit-2',
      action_type: 'update',
      table_name: 'employees',
      record_id: 'EMP-001',
      changed_by: 'user-2',
      user_name: 'Jane Smith',
      old_data: { salary: 800000 },
      new_data: { salary: 850000 },
      description: 'Updated employee salary',
      changed_at: '2024-06-14T14:15:00Z'
    },
    {
      id: 'audit-3',
      action_type: 'delete',
      table_name: 'invoices',
      record_id: 'INV-123',
      changed_by: 'user-1',
      user_name: 'John Doe',
      old_data: { amount: 500000, status: 'draft' },
      description: 'Deleted draft invoice',
      changed_at: '2024-06-13T09:20:00Z'
    }
  ];

  static logAction(action: Omit<AuditLog, 'id' | 'changed_at' | 'changed_by' | 'user_name'>): void {
    const auditEntry: AuditLog = {
      ...action,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      changed_by: 'current-user',
      user_name: 'Current User',
      changed_at: new Date().toISOString()
    };

    this.auditLogs.unshift(auditEntry);
    console.log('Audit log entry created:', auditEntry);
    
    // Store in localStorage for persistence
    localStorage.setItem('audit-logs', JSON.stringify(this.auditLogs));
  }

  static getAuditLogs(filters?: {
    table_name?: string;
    record_id?: string;
    action_type?: string;
    from_date?: string;
    to_date?: string;
  }): AuditLog[] {
    // Load from localStorage if not in memory
    if (this.auditLogs.length <= 3) {
      const stored = localStorage.getItem('audit-logs');
      if (stored) {
        this.auditLogs = JSON.parse(stored);
      }
    }

    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.table_name) {
        logs = logs.filter(log => log.table_name === filters.table_name);
      }
      if (filters.record_id) {
        logs = logs.filter(log => log.record_id === filters.record_id);
      }
      if (filters.action_type) {
        logs = logs.filter(log => log.action_type === filters.action_type);
      }
      if (filters.from_date) {
        logs = logs.filter(log => new Date(log.changed_at) >= new Date(filters.from_date!));
      }
      if (filters.to_date) {
        logs = logs.filter(log => new Date(log.changed_at) <= new Date(filters.to_date!));
      }
    }

    return logs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  }

  static getActivitySummary(days: number = 7): {
    totalActions: number;
    actionsByType: Record<string, number>;
    activeUsers: string[];
    mostActiveTable: string;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentLogs = this.auditLogs.filter(log => new Date(log.changed_at) >= cutoffDate);

    const actionsByType = recentLogs.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tableActivity = recentLogs.reduce((acc, log) => {
      acc[log.table_name] = (acc[log.table_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveTable = Object.entries(tableActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalActions: recentLogs.length,
      actionsByType,
      activeUsers: [...new Set(recentLogs.map(log => log.user_name))],
      mostActiveTable
    };
  }

  static getRecentActivity(limit: number = 10): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  static exportAuditLog(fromDate: string, toDate: string): string {
    const logs = this.getAuditLogs({ from_date: fromDate, to_date: toDate });
    
    const csvContent = [
      'Date,Action,Table,Record ID,User,Description,Changes',
      ...logs.map(log => [
        new Date(log.changed_at).toLocaleDateString(),
        log.action_type,
        log.table_name,
        log.record_id,
        log.user_name,
        log.description,
        log.new_data ? JSON.stringify(log.new_data) : ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Track capital and ownership changes specifically
  static logCapitalChange(action: string, recordId: string, oldData?: any, newData?: any) {
    this.logAction({
      action_type: action as any,
      table_name: 'company_capital',
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      description: `Capital structure ${action}: ${recordId}`
    });
  }

  static logShareholderChange(action: string, recordId: string, oldData?: any, newData?: any) {
    this.logAction({
      action_type: action as any,
      table_name: 'shareholders',
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      description: `Shareholder ${action}: ${newData?.name || recordId}`
    });
  }

  static logBeneficialOwnerChange(action: string, recordId: string, oldData?: any, newData?: any) {
    this.logAction({
      action_type: action as any,
      table_name: 'beneficial_owners',
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      description: `Beneficial owner ${action}: ${newData?.full_name || recordId}`
    });
  }

  static logDividendAction(action: string, recordId: string, oldData?: any, newData?: any) {
    this.logAction({
      action_type: action as any,
      table_name: 'dividends',
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      description: `Dividend ${action}: ${newData?.period || recordId}`
    });
  }

  // Get comprehensive audit report
  static getComprehensiveAuditReport(fromDate: string, toDate: string) {
    const logs = this.getAuditLogs({ from_date: fromDate, to_date: toDate });
    
    const summary = {
      total_actions: logs.length,
      by_table: logs.reduce((acc, log) => {
        acc[log.table_name] = (acc[log.table_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_action: logs.reduce((acc, log) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      critical_changes: logs.filter(log => 
        ['company_capital', 'shareholders', 'beneficial_owners', 'dividends'].includes(log.table_name)
      ),
      recent_activity: logs.slice(0, 20)
    };

    return {
      period: { fromDate, toDate },
      summary,
      detailed_logs: logs,
      generated_at: new Date().toISOString()
    };
  }
}

export default AuditLogService;
