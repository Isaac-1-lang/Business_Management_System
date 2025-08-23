
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import PayrollService from "@/services/payrollService";

export function EmployeeOverview() {
  const [employeeData, setEmployeeData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    pendingActions: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      const employees = PayrollService.getAllEmployees();
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      
      const newHires = employees.filter(emp => 
        new Date(emp.startDate) >= lastMonth
      ).length;

      const activeEmployees = employees.filter(emp => emp.status === 'active').length;
      const pendingActions = employees.filter(emp => 
        emp.status === 'inactive' || !emp.rssbNumber
      ).length;

      setEmployeeData({
        totalEmployees: employees.length,
        activeEmployees,
        newHires,
        pendingActions,
        monthlyGrowth: employees.length > 0 ? (newHires / employees.length) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employee Overview</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Employee Overview</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold">{employeeData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active: {employeeData.activeEmployees}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-3 h-3 text-blue-500" />
              <span>New: {employeeData.newHires}</span>
            </div>
          </div>

          {employeeData.pendingActions > 0 && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{employeeData.pendingActions} pending actions</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+{employeeData.monthlyGrowth.toFixed(1)}% this month</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/payroll-hr'}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
