
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981",
  },
  expenses: {
    label: "Expenses", 
    color: "#ef4444",
  },
};

const expenseChartConfig = {
  salaries: {
    label: "Salaries",
    color: "#8884d8",
  },
  rent: {
    label: "Rent",
    color: "#82ca9d",
  },
  utilities: {
    label: "Utilities",
    color: "#ffc658",
  },
  marketing: {
    label: "Marketing",
    color: "#ff7300",
  },
  other: {
    label: "Other",
    color: "#8dd1e1",
  },
};

interface ReportChartsProps {
  revenueData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  expenseCategories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function ReportCharts({ revenueData, expenseCategories }: ReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" />
              <Bar dataKey="expenses" fill="var(--color-expenses)" name="Expenses" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={expenseChartConfig} className="h-64">
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
