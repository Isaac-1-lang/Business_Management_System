
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, DollarSign, Calculator, Receipt, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const { toast } = useToast();

  const quickActions = [
    {
      title: "New Invoice",
      description: "Create customer invoice",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      path: "/invoices-receipts"
    },
    {
      title: "Add Employee",
      description: "Register new staff member",
      icon: Users,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      path: "/payroll-hr"
    },
    {
      title: "Record Transaction",
      description: "Log business transaction",
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      path: "/general-ledger"
    },
    {
      title: "Generate Report",
      description: "Create financial report",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      path: "/reports-audit"
    },
    {
      title: "Tax Calculator",
      description: "Calculate tax obligations",
      icon: Calculator,
      color: "bg-red-50 text-red-600 hover:bg-red-100",
      path: "/tax-returns"
    },
    {
      title: "Expense Receipt",
      description: "Upload business expense",
      icon: Receipt,
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      path: "/invoices-receipts"
    }
  ];

  const handleActionClick = (action: typeof quickActions[0]) => {
    toast({
      title: `Opening ${action.title}`,
      description: action.description,
    });
    
    // Navigate to the specified path
    window.location.href = action.path;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} transition-colors`}
                onClick={() => handleActionClick(action)}
              >
                <IconComponent className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = '/help'}
          >
            <FileText className="w-4 h-4 mr-2" />
            View All Features
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
