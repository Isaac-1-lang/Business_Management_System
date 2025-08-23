
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RegisterTable } from "./RegisterTable";

interface ShareRecord {
  id: number;
  certificateNo: string;
  holder: string;
  shares: number;
  date: string;
}

interface ShareCertificatesTabProps {
  shareRecords: ShareRecord[];
  onAddCertificate: () => void;
}

export function ShareCertificatesTab({ shareRecords, onAddCertificate }: ShareCertificatesTabProps) {
  const columns = [
    { key: 'certificateNo', label: 'Certificate No.', render: (value: string) => <span className="font-medium">{value}</span> },
    { key: 'holder', label: 'Shareholder' },
    { key: 'shares', label: 'Number of Shares', render: (value: number) => value.toLocaleString() },
    { key: 'date', label: 'Issue Date' }
  ];

  return (
    <Card>
      <CardHeader>
        <RegisterTable
          title="Share Certificate Register"
          icon={<FileText className="w-5 h-5" />}
          columns={columns}
          data={shareRecords}
          onAdd={onAddCertificate}
          addButtonLabel="Add Certificate"
          searchPlaceholder="Search certificates..."
        />
      </CardHeader>
    </Card>
  );
}
