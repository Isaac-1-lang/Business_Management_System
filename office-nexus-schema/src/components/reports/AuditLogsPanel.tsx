
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuditLogService, { AuditLog } from '@/services/auditLogService';
import AuditFilters from './audit/AuditFilters';
import AuditLogTable from './audit/AuditLogTable';

export default function AuditLogsPanel() {
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');

  useEffect(() => {
    loadAuditLogs();
  }, [dateFilter]);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, searchQuery, actionFilter, moduleFilter]);

  const loadAuditLogs = () => {
    const fromDate = new Date(Date.now() - parseInt(dateFilter) * 24 * 60 * 60 * 1000);
    const logs = AuditLogService.getAuditLogs({
      from_date: fromDate.toISOString()
    });
    setAuditLogs(logs);
  };

  const applyFilters = () => {
    let filtered = [...auditLogs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(query) ||
        log.user_name.toLowerCase().includes(query) ||
        log.table_name.toLowerCase().includes(query)
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action_type === actionFilter);
    }

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.table_name === moduleFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportAuditLog = () => {
    const fromDate = new Date(Date.now() - parseInt(dateFilter) * 24 * 60 * 60 * 1000);
    const csvContent = AuditLogService.exportAuditLog(
      fromDate.toISOString(),
      new Date().toISOString()
    );

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Audit Log Exported",
      description: "Audit log has been downloaded as CSV file",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Trail
          </CardTitle>
          <Button variant="outline" onClick={exportAuditLog}>
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuditFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            actionFilter={actionFilter}
            setActionFilter={setActionFilter}
            moduleFilter={moduleFilter}
            setModuleFilter={setModuleFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onApplyFilters={applyFilters}
          />
          <AuditLogTable logs={filteredLogs} />
        </div>
      </CardContent>
    </Card>
  );
}
