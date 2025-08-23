
import { useState } from "react";
import { ArrowLeft, Calendar, Plus, Filter, Download, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ComplianceCalendar() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  const upcomingDeadlines = [
    {
      id: 1,
      task: "VAT Return Filing",
      dueDate: "2024-07-15",
      priority: "high",
      department: "Finance",
      description: "Monthly VAT return submission to RRA",
      status: "pending"
    },
    {
      id: 2,
      task: "PAYE Returns",
      dueDate: "2024-07-20",
      priority: "medium",
      department: "HR",
      description: "Employee PAYE deductions submission",
      status: "in-progress"
    },
    {
      id: 3,
      task: "Annual License Renewal",
      dueDate: "2024-08-01",
      priority: "high",
      department: "Compliance",
      description: "Business license renewal with RDB",
      status: "pending"
    },
    {
      id: 4,
      task: "Quarterly CIT Filing",
      dueDate: "2024-07-31",
      priority: "medium",
      department: "Finance",
      description: "Corporate Income Tax quarterly filing",
      status: "pending"
    },
    {
      id: 5,
      task: "Board Meeting Minutes",
      dueDate: "2024-07-25",
      priority: "low",
      department: "Governance",
      description: "Quarterly board meeting documentation",
      status: "completed"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSetReminder = (taskId: number) => {
    toast({
      title: "Reminder Set",
      description: "You will be notified 3 days before the deadline"
    });
  };

  const handleMarkComplete = (taskId: number) => {
    toast({
      title: "Task Completed",
      description: "Task has been marked as completed"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Compliance Calendar</h1>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Calendar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Deadline
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingDeadlines.map((deadline) => (
                  <TableRow key={deadline.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deadline.task}</div>
                        <div className="text-sm text-gray-600">{deadline.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{deadline.dueDate}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{deadline.department}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(deadline.status)}>
                        {deadline.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSetReminder(deadline.id)}
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleMarkComplete(deadline.id)}
                          disabled={deadline.status === "completed"}
                        >
                          Complete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
