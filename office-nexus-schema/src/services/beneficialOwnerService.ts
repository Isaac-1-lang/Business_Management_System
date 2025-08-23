
export interface BeneficialOwner {
  id: string;
  company_id: string;
  full_name: string;
  nationality: string;
  id_number: string;
  date_of_birth?: string;
  relationship_to_company: 'direct_owner' | 'indirect_owner' | 'ultimate_controller' | 'nominee_beneficiary' | 'trustee' | 'other';
  ownership_percentage: number;
  control_percentage: number;
  has_significant_control: boolean;
  control_nature: string[];
  linked_shareholder_ids: string[];
  address: string;
  contact_info?: string;
  document_urls: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OwnershipMapping {
  id: string;
  company_id: string;
  shareholder_id: string;
  beneficial_owner_id: string;
  relationship_type: 'direct' | 'nominee' | 'trust' | 'corporate_structure';
  percentage_held: number;
  notes?: string;
  created_at: string;
}

class BeneficialOwnerService {
  private static beneficialOwners: BeneficialOwner[] = [];
  private static ownershipMappings: OwnershipMapping[] = [];

  static getCurrentCompanyId(): string {
    return localStorage.getItem('selectedCompanyId') || 'comp-001';
  }

  static addBeneficialOwner(data: Omit<BeneficialOwner, 'id' | 'created_at' | 'updated_at' | 'company_id'> & { company_id?: string }): BeneficialOwner {
    const companyId = data.company_id || this.getCurrentCompanyId();
    
    const beneficialOwner: BeneficialOwner = {
      ...data,
      id: `bo-${Date.now()}`,
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.beneficialOwners.push(beneficialOwner);
    console.log('Beneficial owner added:', beneficialOwner);
    return beneficialOwner;
  }

  static getAllBeneficialOwners(companyId?: string): BeneficialOwner[] {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    return this.beneficialOwners
      .filter(bo => bo.company_id === targetCompanyId)
      .sort((a, b) => b.ownership_percentage - a.ownership_percentage);
  }

  static getBeneficialOwnerById(id: string): BeneficialOwner | null {
    return this.beneficialOwners.find(bo => bo.id === id) || null;
  }

  static updateBeneficialOwner(id: string, updates: Partial<BeneficialOwner>): BeneficialOwner | null {
    const ownerIndex = this.beneficialOwners.findIndex(bo => bo.id === id);
    if (ownerIndex === -1) return null;

    this.beneficialOwners[ownerIndex] = {
      ...this.beneficialOwners[ownerIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.beneficialOwners[ownerIndex];
  }

  static deleteBeneficialOwner(id: string): boolean {
    const initialLength = this.beneficialOwners.length;
    this.beneficialOwners = this.beneficialOwners.filter(bo => bo.id !== id);
    
    // Also remove related ownership mappings
    this.ownershipMappings = this.ownershipMappings.filter(om => om.beneficial_owner_id !== id);
    
    return this.beneficialOwners.length < initialLength;
  }

  static linkToShareholder(beneficialOwnerId: string, shareholderId: string, relationshipType: OwnershipMapping['relationship_type'], percentageHeld: number): OwnershipMapping {
    const mapping: OwnershipMapping = {
      id: `om-${Date.now()}`,
      company_id: this.getCurrentCompanyId(),
      shareholder_id: shareholderId,
      beneficial_owner_id: beneficialOwnerId,
      relationship_type: relationshipType,
      percentage_held: percentageHeld,
      created_at: new Date().toISOString()
    };

    this.ownershipMappings.push(mapping);
    return mapping;
  }

  static getOwnershipMappings(companyId?: string): OwnershipMapping[] {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    return this.ownershipMappings.filter(om => om.company_id === targetCompanyId);
  }

  static getBeneficialOwnersByShareholder(shareholderId: string): BeneficialOwner[] {
    const mappings = this.ownershipMappings.filter(om => om.shareholder_id === shareholderId);
    return mappings.map(mapping => 
      this.beneficialOwners.find(bo => bo.id === mapping.beneficial_owner_id)
    ).filter(Boolean) as BeneficialOwner[];
  }

  static getShareholdersByBeneficialOwner(beneficialOwnerId: string): string[] {
    const mappings = this.ownershipMappings.filter(om => om.beneficial_owner_id === beneficialOwnerId);
    return mappings.map(mapping => mapping.shareholder_id);
  }

  static validateOwnershipPercentages(companyId?: string): { isValid: boolean; totalPercentage: number; violations: string[] } {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const beneficialOwners = this.getAllBeneficialOwners(targetCompanyId);
    
    const totalPercentage = beneficialOwners.reduce((sum, bo) => sum + bo.ownership_percentage, 0);
    const violations: string[] = [];

    if (totalPercentage > 100) {
      violations.push(`Total beneficial ownership exceeds 100% (${totalPercentage.toFixed(2)}%)`);
    }

    // Check for significant control thresholds
    const significantOwners = beneficialOwners.filter(bo => bo.ownership_percentage >= 25);
    if (significantOwners.length === 0 && beneficialOwners.length > 0) {
      violations.push('No beneficial owner with 25%+ ownership identified');
    }

    return {
      isValid: violations.length === 0,
      totalPercentage,
      violations
    };
  }

  static generateBeneficialOwnershipRegister(companyId?: string) {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const beneficialOwners = this.getAllBeneficialOwners(targetCompanyId);
    const mappings = this.getOwnershipMappings(targetCompanyId);
    const validation = this.validateOwnershipPercentages(targetCompanyId);

    return {
      company_id: targetCompanyId,
      generated_at: new Date().toISOString(),
      beneficial_owners: beneficialOwners,
      ownership_mappings: mappings,
      validation_results: validation,
      total_beneficial_owners: beneficialOwners.length,
      significant_controllers: beneficialOwners.filter(bo => bo.has_significant_control).length
    };
  }

  static exportToCSV(companyId?: string): string {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const beneficialOwners = this.getAllBeneficialOwners(targetCompanyId);
    
    const headers = [
      'Full Name', 'Nationality', 'ID Number', 'Ownership %', 'Control %', 
      'Significant Control', 'Relationship', 'Verification Status'
    ];
    
    const rows = beneficialOwners.map(bo => [
      bo.full_name,
      bo.nationality,
      bo.id_number,
      bo.ownership_percentage.toString(),
      bo.control_percentage.toString(),
      bo.has_significant_control ? 'Yes' : 'No',
      bo.relationship_to_company,
      bo.verification_status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export default BeneficialOwnerService;
