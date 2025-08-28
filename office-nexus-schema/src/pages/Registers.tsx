
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ShareCertificateForm } from "@/components/forms/ShareCertificateForm";
import { ChargeForm } from "@/components/forms/ChargeForm";
import { BeneficialOwnerForm } from "@/components/forms/BeneficialOwnerForm";
import { DividendDeclarationForm } from "@/components/forms/DividendDeclarationForm";
import { CapitalManagementDashboard } from "@/components/CapitalManagementDashboard";
import { RegistersHeader } from "@/components/registers/RegistersHeader";
import { ShareCertificatesTab } from "@/components/registers/ShareCertificatesTab";
import { ChargesTab } from "@/components/registers/ChargesTab";
import { BeneficialOwnersTab } from "@/components/registers/BeneficialOwnersTab";

export default function Registers() {
  const [shareRecords, setShareRecords] = useState([]);

  const [chargeRecords, setChargeRecords] = useState([]);

  const [beneficialOwners, setBeneficialOwners] = useState([]);

  const [showShareForm, setShowShareForm] = useState(false);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showBeneficialForm, setShowBeneficialForm] = useState(false);
  const [showDividendForm, setShowDividendForm] = useState(false);

  const [activeTab, setActiveTab] = useState("share-certificates");

  const addShareRecord = (record: any) => {
    setShareRecords([...shareRecords, record]);
  };

  const addChargeRecord = (record: any) => {
    setChargeRecords([...chargeRecords, record]);
  };

  const addBeneficialOwner = (owner: any) => {
    setBeneficialOwners([...beneficialOwners, owner]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <RegistersHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="share-certificates">Share Certificates</TabsTrigger>
            <TabsTrigger value="charges">Charges</TabsTrigger>
            <TabsTrigger value="beneficial-owners">Beneficial Owners</TabsTrigger>
            <TabsTrigger value="capital-management">Capital Management</TabsTrigger>
          </TabsList>

          <TabsContent value="share-certificates">
            <ShareCertificatesTab 
              shareRecords={shareRecords}
              onAddCertificate={() => setShowShareForm(true)}
            />
          </TabsContent>

          <TabsContent value="charges">
            <ChargesTab 
              chargeRecords={chargeRecords}
              onAddCharge={() => setShowChargeForm(true)}
            />
          </TabsContent>

          <TabsContent value="beneficial-owners">
            <BeneficialOwnersTab 
              beneficialOwners={beneficialOwners}
              onAddBeneficialOwner={() => setShowBeneficialForm(true)}
            />
          </TabsContent>

          <TabsContent value="capital-management">
            <CapitalManagementDashboard />
          </TabsContent>
        </Tabs>

        <ShareCertificateForm 
          open={showShareForm} 
          onClose={() => setShowShareForm(false)} 
          onAdd={addShareRecord}
        />
        
        <ChargeForm 
          open={showChargeForm} 
          onClose={() => setShowChargeForm(false)} 
          onAdd={addChargeRecord}
        />
        
        <BeneficialOwnerForm 
          open={showBeneficialForm} 
          onClose={() => setShowBeneficialForm(false)} 
          onAdd={addBeneficialOwner}
        />

        <DividendDeclarationForm 
          open={showDividendForm} 
          onClose={() => setShowDividendForm(false)} 
          onSuccess={() => {
            // Refresh dividend data if needed
          }}
        />
      </div>
    </div>
  );
}
