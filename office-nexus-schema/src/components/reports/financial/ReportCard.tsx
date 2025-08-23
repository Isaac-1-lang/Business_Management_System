
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'financial' | 'tax' | 'compliance' | 'operational';
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function ReportCard({
  title,
  description,
  icon: IconComponent,
  category,
  isGenerating,
  onGenerate
}: ReportCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'tax': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">{title}</h3>
                <Badge className={getCategoryColor(category)} variant="secondary">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">{description}</p>
          
          <Button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
