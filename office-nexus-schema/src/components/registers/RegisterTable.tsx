
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface RegisterTableProps {
  title: string;
  icon: React.ReactNode;
  columns: Column[];
  data: any[];
  onAdd: () => void;
  addButtonLabel: string;
  searchPlaceholder?: string;
  emptyState?: {
    title: string;
    description: string;
  };
}

export function RegisterTable({
  title,
  icon,
  columns,
  data,
  onAdd,
  addButtonLabel,
  searchPlaceholder = "Search records...",
  emptyState
}: RegisterTableProps) {
  if (data.length === 0 && emptyState) {
    return (
      <div className="text-center py-8">
        {icon}
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyState.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyState.description}</p>
        <div className="mt-6">
          <Button onClick={onAdd}>
            {addButtonLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder={searchPlaceholder} className="pl-10 w-64" />
          </div>
          <Button onClick={onAdd}>
            {addButtonLabel}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.key} className="text-left py-3 px-2 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="text-left py-3 px-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr key={record.id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-2">
                    {column.render 
                      ? column.render(record[column.key], record)
                      : record[column.key]
                    }
                  </td>
                ))}
                <td className="py-4 px-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
