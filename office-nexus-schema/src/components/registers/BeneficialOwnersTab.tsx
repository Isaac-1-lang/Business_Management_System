
import { FileText, Plus } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { RegisterTable } from "./RegisterTable";

interface BeneficialOwner {
  id: number;
  name: string;
  nationalId: string;
  ownership: number;
  nationality: string;
}

interface BeneficialOwnersTabProps {
  beneficialOwners: BeneficialOwner[];
  onAddBeneficialOwner: () => void;
}

export function BeneficialOwnersTab({ beneficialOwners, onAddBeneficialOwner }: BeneficialOwnersTabProps) {
  const columns = [
    { key: 'name', label: 'Name', render: (value: string) => <span className="font-medium">{value}</span> },
    { key: 'nationalId', label: 'National ID' },
    { key: 'ownership', label: 'Ownership %', render: (value: number) => `${value}%` },
    { key: 'nationality', label: 'Nationality' }
  ];

  const emptyState = {
    title: "No beneficial ownership records",
    description: "Get started by adding a new beneficial owner record."
  };

  return (
    <Card>
      <CardHeader>
        <RegisterTable
          title="Beneficial Ownership Register"
          icon={<FileText className="w-5 h-5" />}
          columns={columns}
          data={beneficialOwners}
          onAdd={onAddBeneficialOwner}
          addButtonLabel="Add Beneficial Owner"
          emptyState={emptyState}
        />
      </CardHeader>
    </Card>
  );
}
