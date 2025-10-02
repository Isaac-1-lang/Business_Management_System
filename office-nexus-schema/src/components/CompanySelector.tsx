
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
import CompanyService, { Company } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

export default function CompanySelector() {
  const { toast } = useToast();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
    
    // Listen for company changes
    const handleCompanyChange = () => {
      loadCompanyData();
    };
    
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const current = CompanyService.getCurrentCompany();
      const companies = await CompanyService.getUserCompanies('user-001');
      const role = current ? CompanyService.getUserRoleInCompany('user-001', current.id) : '';

      setCurrentCompany(current);
      setUserCompanies(Array.isArray(companies) ? companies : []);
      setUserRole(role || '');
    } catch (error) {
      console.error('Error loading company data:', error);
      setUserCompanies([]); // Ensure it's always an array
      
      // Only show error toast if it's not an authentication error
      if (!error.message?.includes('401') && !error.message?.includes('Unauthorized')) {
        toast({
          title: "Error",
          description: "Failed to load company data",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySwitch = (companyId: string) => {
    CompanyService.setCurrentCompanyId(companyId);
    const newCompany = CompanyService.getCompanyById(companyId);
    
    toast({
      title: "Company Switched",
      description: `Now viewing ${newCompany?.name || 'selected company'}`
    });
    
    // Force page reload to refresh all data
    window.location.reload();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner': return 'bg-purple-100 text-purple-800';
      case 'Accountant': return 'bg-green-100 text-green-800';
      case 'HR': return 'bg-blue-100 text-blue-800';
      case 'Legal': return 'bg-orange-100 text-orange-800';
      case 'ComplianceOfficer': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="w-4 h-4 text-gray-600 animate-pulse" />
        <span className="font-medium">Loading...</span>
      </div>
    );
  }

  if (userCompanies.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="font-medium">{currentCompany?.name || 'Company'}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-between w-full max-w-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="truncate">{currentCompany?.name || 'Select Company'}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg">
        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
          Your Companies ({userCompanies.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userCompanies.map((company) => {
          const role = CompanyService.getUserRoleInCompany('user-001', company.id);
          const isActive = currentCompany?.id === company.id;
          
          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => !isActive && handleCompanySwitch(company.id)}
              className={`cursor-pointer p-3 ${isActive ? 'bg-blue-50' : ''}`}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                    {company.name}
                  </span>
                  {isActive && <Badge variant="secondary" className="text-xs">Current</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>TIN: {company.tin || 'N/A'}</span>
                  {role && (
                    <Badge className={`text-xs ${getRoleColor(role)}`}>
                      {role}
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Add New Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
