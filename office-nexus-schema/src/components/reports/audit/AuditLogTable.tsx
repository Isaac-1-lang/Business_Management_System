
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { AuditLog } from '@/services/auditLogService';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      case 'export': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Record ID</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              No audit logs found for the selected criteria
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="text-sm">
                  <div>{new Date(log.changed_at).toLocaleDateString()}</div>
                  <div className="text-gray-500">{new Date(log.changed_at).toLocaleTimeString()}</div>
                </div>
              </TableCell>
              <TableCell>{log.user_name}</TableCell>
              <TableCell>
                <Badge className={getActionBadgeColor(log.action_type)}>
                  {log.action_type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{log.table_name.replace('_', ' ')}</TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell className="font-mono text-sm">{log.record_id}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
