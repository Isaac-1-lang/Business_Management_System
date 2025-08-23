
export interface CompanyCapital {
  id: string;
  company_id: string;
  authorized_shares: number;
  share_price: number;
  total_authorized_capital: number;
  issued_shares: number;
  paid_up_capital: number;
  currency: string;
  capital_type: 'ordinary' | 'preference' | 'mixed';
  created_at: string;
  updated_at: string;
}

export interface CapitalContribution {
  id: string;
  company_id: string;
  shareholder_id: string;
  shareholder_name: string;
  amount: number;
  shares_allocated: number;
  contribution_type: 'cash' | 'bank_transfer' | 'asset_in_kind' | 'loan_conversion' | 'other';
  contribution_date: string;
  description: string;
  document_url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface ShareholderRecord {
  id: string;
  company_id: string;
  name: string;
  national_id: string;
  shares_held: number;
  share_percentage: number;
  entry_date: string;
  is_active: boolean;
  is_director: boolean;
  is_beneficial_owner: boolean;
  linked_beneficial_owner_id?: string;
  nationality: string;
  contact_info?: string;
}

class CompanyCapitalService {
  private static companyCapital: CompanyCapital[] = [];
  private static capitalContributions: CapitalContribution[] = [];
  private static shareholders: ShareholderRecord[] = [];

  static initializeCompanyCapital(data: Omit<CompanyCapital, 'id' | 'created_at' | 'updated_at' | 'total_authorized_capital' | 'issued_shares' | 'paid_up_capital'>): CompanyCapital {
    const capital: CompanyCapital = {
      ...data,
      id: `cap-${Date.now()}`,
      total_authorized_capital: data.authorized_shares * data.share_price,
      issued_shares: 0,
      paid_up_capital: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.companyCapital.push(capital);
    console.log('Company capital initialized:', capital);
    return capital;
  }

  static getCurrentCompanyId(): string {
    return localStorage.getItem('selectedCompanyId') || 'comp-001';
  }

  static getCompanyCapital(companyId?: string): CompanyCapital | null {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    return this.companyCapital.find(cap => cap.company_id === targetCompanyId) || null;
  }

  static addCapitalContribution(data: Omit<CapitalContribution, 'id' | 'created_at' | 'company_id'> & { company_id?: string }): CapitalContribution {
    const companyId = data.company_id || this.getCurrentCompanyId();
    
    const contribution: CapitalContribution = {
      ...data,
      id: `contrib-${Date.now()}`,
      company_id: companyId,
      created_at: new Date().toISOString()
    };

    this.capitalContributions.push(contribution);
    
    // Update company capital when contribution is confirmed
    if (contribution.status === 'confirmed') {
      this.updateCapitalFromContribution(contribution);
    }

    return contribution;
  }

  private static updateCapitalFromContribution(contribution: CapitalContribution): void {
    const capital = this.getCompanyCapital(contribution.company_id);
    if (!capital) return;

    capital.issued_shares += contribution.shares_allocated;
    capital.paid_up_capital += contribution.amount;
    capital.updated_at = new Date().toISOString();

    // Update or create shareholder record
    this.updateShareholderFromContribution(contribution);
  }

  private static updateShareholderFromContribution(contribution: CapitalContribution): void {
    const existingShareholder = this.shareholders.find(
      s => s.company_id === contribution.company_id && s.national_id === contribution.shareholder_id
    );

    if (existingShareholder) {
      existingShareholder.shares_held += contribution.shares_allocated;
      existingShareholder.share_percentage = this.calculateSharePercentage(
        existingShareholder.shares_held, 
        contribution.company_id
      );
    } else {
      const newShareholder: ShareholderRecord = {
        id: `sh-${Date.now()}`,
        company_id: contribution.company_id,
        name: contribution.shareholder_name,
        national_id: contribution.shareholder_id,
        shares_held: contribution.shares_allocated,
        share_percentage: this.calculateSharePercentage(contribution.shares_allocated, contribution.company_id),
        entry_date: contribution.contribution_date,
        is_active: true,
        is_director: false,
        is_beneficial_owner: true,
        nationality: 'Rwandan'
      };
      this.shareholders.push(newShareholder);
    }
  }

  private static calculateSharePercentage(shares: number, companyId: string): number {
    const capital = this.getCompanyCapital(companyId);
    if (!capital || capital.issued_shares === 0) return 0;
    return (shares / capital.issued_shares) * 100;
  }

  static getAllShareholders(companyId?: string): ShareholderRecord[] {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    return this.shareholders.filter(s => s.company_id === targetCompanyId);
  }

  static getCapitalContributions(companyId?: string): CapitalContribution[] {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    return this.capitalContributions
      .filter(c => c.company_id === targetCompanyId)
      .sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime());
  }

  static getCapitalSummary(companyId?: string) {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const capital = this.getCompanyCapital(targetCompanyId);
    const shareholders = this.getAllShareholders(targetCompanyId);
    const contributions = this.getCapitalContributions(targetCompanyId);

    if (!capital) {
      return {
        authorized_capital: 0,
        issued_capital: 0,
        paid_up_capital: 0,
        remaining_shares: 0,
        total_shareholders: 0,
        utilization_percentage: 0
      };
    }

    return {
      authorized_capital: capital.total_authorized_capital,
      issued_capital: capital.issued_shares * capital.share_price,
      paid_up_capital: capital.paid_up_capital,
      remaining_shares: capital.authorized_shares - capital.issued_shares,
      total_shareholders: shareholders.length,
      utilization_percentage: (capital.issued_shares / capital.authorized_shares) * 100,
      contributions_count: contributions.length
    };
  }

  static validateShareAllocation(newShares: number, companyId?: string): { isValid: boolean; message: string; availableShares: number } {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const capital = this.getCompanyCapital(targetCompanyId);
    
    if (!capital) {
      return {
        isValid: false,
        message: 'Company capital not initialized',
        availableShares: 0
      };
    }

    const availableShares = capital.authorized_shares - capital.issued_shares;
    
    if (newShares > availableShares) {
      return {
        isValid: false,
        message: `Only ${availableShares.toLocaleString()} shares available. Cannot allocate ${newShares.toLocaleString()} shares.`,
        availableShares
      };
    }

    return {
      isValid: true,
      message: 'Share allocation is valid',
      availableShares
    };
  }

  static updateShareholderStatus(shareholderId: string, updates: Partial<ShareholderRecord>): ShareholderRecord | null {
    const shareholderIndex = this.shareholders.findIndex(s => s.id === shareholderId);
    if (shareholderIndex === -1) return null;

    this.shareholders[shareholderIndex] = {
      ...this.shareholders[shareholderIndex],
      ...updates
    };

    return this.shareholders[shareholderIndex];
  }

  static exportCapitalData(companyId?: string) {
    const targetCompanyId = companyId || this.getCurrentCompanyId();
    const capital = this.getCompanyCapital(targetCompanyId);
    const shareholders = this.getAllShareholders(targetCompanyId);
    const contributions = this.getCapitalContributions(targetCompanyId);

    return {
      company_capital: capital,
      shareholders,
      contributions,
      summary: this.getCapitalSummary(targetCompanyId)
    };
  }
}

export default CompanyCapitalService;
