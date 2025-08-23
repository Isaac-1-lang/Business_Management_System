
export interface CapitalEntry {
  id: string;
  company_id: string;
  shareholder_id: string;
  shareholder_name: string;
  amount: number;
  date_contributed: string;
  method: 'cash' | 'bank_transfer' | 'asset_in_kind' | 'other';
  description: string;
  file_url?: string;
  type: 'contribution' | 'withdrawal' | 'adjustment';
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  created_by: string;
}

export interface CapitalSummary {
  total_capital: number;
  total_contributions: number;
  total_withdrawals: number;
  shareholder_breakdown: Array<{
    shareholder_id: string;
    shareholder_name: string;
    total_contribution: number;
    ownership_percentage: number;
    entry_count: number;
  }>;
}

class CapitalService {
  private static capitalEntries: CapitalEntry[] = [];
  private static entryCounter = 1;

  static addCapitalEntry(data: Omit<CapitalEntry, 'id' | 'created_at' | 'company_id'> & { company_id?: string }): CapitalEntry {
    const companyId = data.company_id || this.getCurrentCompanyId();
    
    const entry: CapitalEntry = {
      id: `CAP-${Date.now()}-${this.entryCounter++}`,
      ...data,
      company_id: companyId,
      created_at: new Date().toISOString()
    };

    this.capitalEntries.push(entry);
    console.log(`Created capital entry: ${entry.id} for company: ${companyId}`);
    
    return entry;
  }

  private static getCurrentCompanyId(): string {
    return localStorage.getItem('selectedCompanyId') || 'comp-001';
  }

  static getAllCapitalEntries(): CapitalEntry[] {
    const currentCompanyId = this.getCurrentCompanyId();
    return this.capitalEntries
      .filter(entry => entry.company_id === currentCompanyId)
      .sort((a, b) => new Date(b.date_contributed).getTime() - new Date(a.date_contributed).getTime());
  }

  static getCapitalEntriesByShareholder(shareholderId: string): CapitalEntry[] {
    const currentCompanyId = this.getCurrentCompanyId();
    return this.capitalEntries.filter(entry => 
      entry.company_id === currentCompanyId && entry.shareholder_id === shareholderId
    );
  }

  static getCapitalEntriesByDateRange(startDate: string, endDate: string): CapitalEntry[] {
    const currentCompanyId = this.getCurrentCompanyId();
    return this.capitalEntries.filter(entry => 
      entry.company_id === currentCompanyId &&
      entry.date_contributed >= startDate && 
      entry.date_contributed <= endDate
    );
  }

  static updateCapitalEntry(id: string, updates: Partial<CapitalEntry>): CapitalEntry | null {
    const currentCompanyId = this.getCurrentCompanyId();
    const entryIndex = this.capitalEntries.findIndex(entry => 
      entry.id === id && entry.company_id === currentCompanyId
    );
    
    if (entryIndex === -1) return null;

    this.capitalEntries[entryIndex] = {
      ...this.capitalEntries[entryIndex],
      ...updates
    };

    return this.capitalEntries[entryIndex];
  }

  static deleteCapitalEntry(id: string): boolean {
    const currentCompanyId = this.getCurrentCompanyId();
    const initialLength = this.capitalEntries.length;
    this.capitalEntries = this.capitalEntries.filter(entry => 
      !(entry.id === id && entry.company_id === currentCompanyId)
    );
    return this.capitalEntries.length < initialLength;
  }

  static getCapitalSummary(): CapitalSummary {
    const currentCompanyId = this.getCurrentCompanyId();
    const companyEntries = this.capitalEntries.filter(entry => entry.company_id === currentCompanyId);
    
    const totalContributions = companyEntries
      .filter(entry => entry.type === 'contribution')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalWithdrawals = companyEntries
      .filter(entry => entry.type === 'withdrawal')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalCapital = totalContributions - totalWithdrawals;

    // Calculate breakdown by shareholder
    const shareholderMap = new Map<string, { name: string; total: number; count: number }>();
    
    companyEntries.forEach(entry => {
      const existing = shareholderMap.get(entry.shareholder_id) || { 
        name: entry.shareholder_name, 
        total: 0, 
        count: 0 
      };
      
      if (entry.type === 'contribution') {
        existing.total += entry.amount;
      } else if (entry.type === 'withdrawal') {
        existing.total -= entry.amount;
      }
      existing.count += 1;
      
      shareholderMap.set(entry.shareholder_id, existing);
    });

    const shareholderBreakdown = Array.from(shareholderMap.entries()).map(([shareholderId, data]) => ({
      shareholder_id: shareholderId,
      shareholder_name: data.name,
      total_contribution: data.total,
      ownership_percentage: totalCapital > 0 ? (data.total / totalCapital) * 100 : 0,
      entry_count: data.count
    })).sort((a, b) => b.total_contribution - a.total_contribution);

    return {
      total_capital: totalCapital,
      total_contributions: totalContributions,
      total_withdrawals: totalWithdrawals,
      shareholder_breakdown: shareholderBreakdown
    };
  }

  static exportToCSV(): string {
    const currentCompanyId = this.getCurrentCompanyId();
    const companyEntries = this.capitalEntries.filter(entry => entry.company_id === currentCompanyId);
    
    const headers = ['Date', 'Shareholder', 'Type', 'Amount', 'Method', 'Description', 'Status'];
    const rows = companyEntries.map(entry => [
      entry.date_contributed,
      entry.shareholder_name,
      entry.type,
      entry.amount.toString(),
      entry.method,
      entry.description,
      entry.status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export default CapitalService;
