
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import DataIntegrationService from '@/services/dataIntegrationService';

export function DataSyncNotification() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    // Subscribe to sync events
    DataIntegrationService.subscribe('sync-complete', (data: any) => {
      setSyncStatus('success');
      setLastSync(data.timestamp);
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    });

    // Subscribe to various data changes
    ['directors', 'employees', 'transactions', 'tax'].forEach(module => {
      DataIntegrationService.subscribe(module, () => {
        setSyncStatus('syncing');
      });
    });
  }, []);

  if (syncStatus === 'idle') return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {syncStatus === 'syncing' && (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-medium">Syncing Data...</div>
                <div className="text-sm text-gray-600">Updating related records</div>
              </div>
              <Badge variant="secondary">Syncing</Badge>
            </>
          )}
          
          {syncStatus === 'success' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Data Synced</div>
                <div className="text-sm text-gray-600">All records updated</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Complete</Badge>
            </>
          )}
          
          {syncStatus === 'error' && (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium">Sync Error</div>
                <div className="text-sm text-gray-600">Some records may be outdated</div>
              </div>
              <Badge variant="destructive">Error</Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
