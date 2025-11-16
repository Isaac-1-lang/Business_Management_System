
import { useState, useEffect } from "react";
import { Building2, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/services/apiService";

export default function CompanySelector() {
  const { toast } = useToast();
  const { companies, selectedCompany, setSelectedCompany } = useAuth();
  const [loading, setLoading] = useState(false);

  // Set initial company if not set
  useEffect(() => {
    if (!selectedCompany && companies.length > 0) {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      const companyToSelect = savedCompanyId 
        ? companies.find(c => String(c.id) === savedCompanyId) || companies[0]
        : companies[0];
      
      if (companyToSelect) {
        setSelectedCompany(companyToSelect);
        localStorage.setItem('selectedCompanyId', String(companyToSelect.id));
      }
    }
  }, [companies, selectedCompany, setSelectedCompany]);

  const handleCompanySwitch = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompanyId', String(company.id));
    
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('companyChanged', { 
      detail: { companyId: company.id, company } 
    }));
    
    toast({
      title: "Company Switched",
      description: `Now viewing ${company.name}`
    });
    
    // Reload page to refresh all data with new company context
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="w-4 h-4 text-gray-600 animate-pulse" />
        <span className="font-medium">Loading...</span>
      </div>
    );
  }

  // If no companies, show message
  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600">
        <Building2 className="w-4 h-4" />
        <span className="font-medium">No Company</span>
      </div>
    );
  }

  // If only one company, just show it
  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="font-medium">{selectedCompany?.name || companies[0]?.name || 'Company'}</span>
      </div>
    );
  }

  // Multiple companies - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-between w-full max-w-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="truncate">{selectedCompany?.name || 'Select Company'}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg">
        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
          Your Companies ({companies.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {companies.map((company) => {
          const isActive = selectedCompany?.id === company.id;
          
          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => !isActive && handleCompanySwitch(company)}
              className={`cursor-pointer p-3 ${isActive ? 'bg-blue-50' : ''}`}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                    {company.name}
                  </span>
                  {isActive && <Badge variant="secondary" className="text-xs">Current</Badge>}
                </div>
                {company.tin && (
                  <div className="text-xs text-gray-600">
                    TIN: {company.tin}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-blue-600"
          onClick={() => {
            // Navigate to company creation page or open modal
            window.location.href = '/company-profile';
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
