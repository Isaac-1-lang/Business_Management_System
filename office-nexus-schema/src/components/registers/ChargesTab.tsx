
import { FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterTable } from "./RegisterTable";

interface ChargeRecord {
  id: number;
  type: string;
  amount: string;
  creditor: string;
  date: string;
  status: string;
}

interface ChargesTabProps {
  chargeRecords: ChargeRecord[];
  onAddCharge: () => void;
}

export function ChargesTab({ chargeRecords, onAddCharge }: ChargesTabProps) {
  const columns = [
    { key: 'type', label: 'Type', render: (value: string) => <span className="font-medium">{value}</span> },
    { key: 'amount', label: 'Amount' },
    { key: 'creditor', label: 'Creditor' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => (
        <Badge className="bg-green-100 text-green-700">{value}</Badge>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <RegisterTable
          title="Charges & Mortgages Register"
          icon={<FileText className="w-5 h-5" />}
          columns={columns}
          data={chargeRecords}
          onAdd={onAddCharge}
          addButtonLabel="Add Charge"
        />
      </CardHeader>
    </Card>
  );
}
