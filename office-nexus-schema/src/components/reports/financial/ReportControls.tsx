
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download } from 'lucide-react';

interface ReportControlsProps {
  dateRange: {
    from: string;
    to: string;
  };
  setDateRange: (range: { from: string; to: string }) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
}

export default function ReportControls({
  dateRange,
  setDateRange,
  onGenerateAll,
  isGenerating
}: ReportControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
          <Button 
            onClick={onGenerateAll}
            disabled={isGenerating}
            className="whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate All Reports'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
