/**
 * COMPANY SERVICE - companyService.ts
 * 
 * This service manages all company-related data and operations.
 * It provides a centralized way to handle company information, user roles,
 * and company switching functionality.
 * 
 * SERVICE ARCHITECTURE:
 * - Static methods for easy access without instantiation
 * - Local storage for persistent company selection
 * - Event-driven updates for real-time component synchronization
 * - Mock data for development (replace with actual API calls)
 * 
 * KEY FEATURES:
 * 1. Company CRUD operations
 * 2. User role management
 * 3. Multi-company support
 * 4. Company switching with persistence
 * 5. Event notifications for UI updates
 * 
 * TO USE IN COMPONENTS:
 * ```tsx
 * import { companyService } from '@/services/companyService';
 * 
 * // Get current company
 * const currentCompany = companyService.getCurrentCompany();
 * 
 * // Switch companies
 * companyService.setCurrentCompanyId('comp-002');
 * 
 * // Listen for company changes
 * useEffect(() => {
 *   const handleCompanyChange = (event) => {
 *     console.log('Company changed to:', event.detail.companyId);
 *   };
 *   window.addEventListener('companyChanged', handleCompanyChange);
 *   return () => window.removeEventListener('companyChanged', handleCompanyChange);
 * }, []);
 * ```
 * 
 * TO EXTEND:
 * 1. Add new company properties to the Company interface
 * 2. Create new methods for specific business logic
 * 3. Replace mock data with actual API calls
 * 4. Add error handling and validation
 * 5. Implement caching strategies
 */

// Company data structure - represents a business entity
export interface Company {
  id: string;                    // Unique company identifier
  name: string;                  // Company name
  tin?: string;                  // Tax Identification Number
  registration_number?: string;  // Business registration number
  address?: string;              // Company address
  phone?: string;                // Contact phone number
  email?: string;                // Contact email address
  logo_url?: string;             // Company logo URL
  currency: string;              // Primary currency (RWF, USD, etc.)
  fiscal_year_start: string;     // Fiscal year start date (MM-DD format)
  tax_regime: string;            // Tax regime type
  status: 'active' | 'inactive' | 'archived';  // Company status
  created_at: string;            // Creation timestamp
  updated_at: string;            // Last update timestamp
}

// User role within a company - defines permissions and access
export interface UserCompanyRole {
  id: string;                    // Unique role identifier
  user_id: string;               // User who has this role
  company_id: string;            // Company where the role applies
  role: 'Owner' | 'Accountant' | 'HR' | 'ReadOnly' | 'Legal' | 'ComplianceOfficer';  // Role type
  granted_at: string;            // When the role was granted
  granted_by: string;            // Who granted the role
}

/**
 * CompanyService class provides all company-related operations
 * Uses static methods for easy access throughout the application
 */
class CompanyService {
  // Mock company data - replace with actual API calls in production
  private static companies: Company[] = [
    {
      id: 'comp-001',
      name: 'Main Company Ltd',
      tin: '123456789',
      registration_number: 'REG001',
      address: 'KG 123 St, Kigali',
      phone: '+250788123456',
      email: 'info@maincompany.rw',
      currency: 'RWF',
      fiscal_year_start: '01-01',
      tax_regime: 'Standard',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp-002',
      name: 'Second Business SARL',
      tin: '987654321',
      registration_number: 'REG002',
      address: 'KG 456 St, Kigali',
      phone: '+250788654321',
      email: 'contact@secondbiz.rw',
      currency: 'RWF',
      fiscal_year_start: '01-01',
      tax_regime: 'Standard',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Mock user-company role data - defines user permissions per company
  private static userCompanyRoles: UserCompanyRole[] = [
    {
      id: 'ucr-001',
      user_id: 'user-001',
      company_id: 'comp-001',
      role: 'Owner',
      granted_at: new Date().toISOString(),
      granted_by: 'system'
    },
    {
      id: 'ucr-002',
      user_id: 'user-001',
      company_id: 'comp-002',
      role: 'Accountant',
      granted_at: new Date().toISOString(),
      granted_by: 'system'
    }
  ];

  /**
   * Get the currently selected company ID from local storage
   * Falls back to 'comp-001' if no company is selected
   * @returns string - Current company ID
   */
  static getCurrentCompanyId(): string {
    return localStorage.getItem('selectedCompanyId') || 'comp-001';
  }

  /**
   * Set the current company ID and persist to local storage
   * Triggers a custom event to notify components of the change
   * @param companyId - The company ID to set as current
   */
  static setCurrentCompanyId(companyId: string): void {
    localStorage.setItem('selectedCompanyId', companyId);
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('companyChanged', { detail: { companyId } }));
  }

  /**
   * Get the currently selected company object
   * @returns Company | null - Current company or null if not found
   */
  static getCurrentCompany(): Company | null {
    const currentId = this.getCurrentCompanyId();
    return this.companies.find(c => c.id === currentId) || null;
  }

  /**
   * Get all companies that a user has access to based on their roles
   * @param userId - User ID to get companies for (defaults to 'user-001')
   * @returns Company[] - Array of accessible companies
   */
  static getUserCompanies(userId: string = 'user-001'): Company[] {
    const userRoles = this.userCompanyRoles.filter(ucr => ucr.user_id === userId);
    const companyIds = userRoles.map(ucr => ucr.company_id);
    return this.companies.filter(c => companyIds.includes(c.id));
  }

  static getUserRoleInCompany(userId: string, companyId: string): string | null {
    const role = this.userCompanyRoles.find(
      ucr => ucr.user_id === userId && ucr.company_id === companyId
    );
    return role ? role.role : null;
  }

  static createCompany(companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Company {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.companies.push(newCompany);
    console.log('Created new company:', newCompany.name);
    return newCompany;
  }

  static updateCompany(companyId: string, updates: Partial<Company>): Company | null {
    const companyIndex = this.companies.findIndex(c => c.id === companyId);
    if (companyIndex === -1) return null;

    this.companies[companyIndex] = {
      ...this.companies[companyIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.companies[companyIndex];
  }

  static addUserToCompany(userId: string, companyId: string, role: UserCompanyRole['role']): void {
    const newRole: UserCompanyRole = {
      id: `ucr-${Date.now()}`,
      user_id: userId,
      company_id: companyId,
      role,
      granted_at: new Date().toISOString(),
      granted_by: 'admin'
    };

    this.userCompanyRoles.push(newRole);
    console.log(`Added user ${userId} to company ${companyId} with role ${role}`);
  }

  static removeUserFromCompany(userId: string, companyId: string): void {
    this.userCompanyRoles = this.userCompanyRoles.filter(
      ucr => !(ucr.user_id === userId && ucr.company_id === companyId)
    );
    console.log(`Removed user ${userId} from company ${companyId}`);
  }

  static getCompanyById(companyId: string): Company | null {
    return this.companies.find(c => c.id === companyId) || null;
  }

  static getAllCompanies(): Company[] {
    return [...this.companies];
  }

  static archiveCompany(companyId: string): void {
    const company = this.companies.find(c => c.id === companyId);
    if (company) {
      company.status = 'archived';
      company.updated_at = new Date().toISOString();
      console.log(`Archived company: ${company.name}`);
    }
  }
}

export default CompanyService;
