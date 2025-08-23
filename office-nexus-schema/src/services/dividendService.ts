import UniversalTransactionService from './universalTransactionService';
import DataIntegrationService from './dataIntegrationService';

export interface DividendDeclaration {
  id: string;
  company_id: string;
  profit_amount: number;
  dividend_percentage: number;
  dividend_pool: number;
  approved_by: string;
  declaration_date: string;
  document_url?: string;
  status: 'draft' | 'confirmed' | 'paid';
  created_at: string;
}

export interface DividendDistribution {
  id: string;
  declaration_id: string;
  shareholder_id: string;
  shareholder_name: string;
  shares_held_at_time: number;
  amount: number;
  is_paid: boolean;
  payment_proof_url?: string;
  paid_on?: string;
}

class DividendService {
  private static declarations: DividendDeclaration[] = [];
  private static distributions: DividendDistribution[] = [];

  static createDividendDeclaration(data: Omit<DividendDeclaration, 'id' | 'created_at' | 'dividend_pool'>): DividendDeclaration {
    const dividend_pool = data.profit_amount * (data.dividend_percentage / 100);
    
    const declaration: DividendDeclaration = {
      ...data,
      id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dividend_pool,
      created_at: new Date().toISOString()
    };

    this.declarations.push(declaration);
    this.saveDeclarations();
    
    console.log('Dividend declaration created:', declaration);
    return declaration;
  }

  static calculateDividendDistribution(declarationId: string): DividendDistribution[] {
    const declaration = this.declarations.find(d => d.id === declarationId);
    if (!declaration) {
      throw new Error('Declaration not found');
    }

    // Get shareholders from the register
    const shareholders = DataIntegrationService.getDirectorsData().filter(
      (person: any) => person.shares && parseFloat(person.shares) > 0
    );

    if (shareholders.length === 0) {
      throw new Error('No shareholders found');
    }

    // Calculate total shares
    const totalShares = shareholders.reduce((sum: number, shareholder: any) => 
      sum + parseFloat(shareholder.shares), 0
    );

    // Calculate per-share dividend
    const perShareDividend = declaration.dividend_pool / totalShares;

    // Create distributions
    const distributions: DividendDistribution[] = shareholders.map((shareholder: any) => {
      const sharesHeld = parseFloat(shareholder.shares);
      const amount = sharesHeld * perShareDividend;

      return {
        id: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        declaration_id: declarationId,
        shareholder_id: shareholder.id.toString(),
        shareholder_name: shareholder.name,
        shares_held_at_time: sharesHeld,
        amount: Math.round(amount), // Round to nearest RWF
        is_paid: false
      };
    });

    // Store distributions
    this.distributions = this.distributions.filter(d => d.declaration_id !== declarationId);
    this.distributions.push(...distributions);
    this.saveDistributions();

    return distributions;
  }

  static confirmDividendDeclaration(declarationId: string): void {
    const declaration = this.declarations.find(d => d.id === declarationId);
    if (!declaration) {
      throw new Error('Declaration not found');
    }

    declaration.status = 'confirmed';
    this.saveDeclarations();

    // Auto-post to UTS - Dividend Declaration
    UniversalTransactionService.createTransaction({
      type: 'expense',
      amount: declaration.dividend_pool,
      description: `Dividend Declaration - ${declaration.declaration_date}`,
      date: declaration.declaration_date,
      payment_method: 'bank',
      reference_number: `DIV-${declaration.id}`,
      tax_category: 'dividend_expense',
      status: 'confirmed',
      company_id: declaration.company_id
    });

    // Create accounting entries for dividend payable
    import('./transactionEngine').then(({ default: TransactionEngine }) => {
      TransactionEngine.postTransaction({
        date: declaration.declaration_date,
        reference: `DIV-DECL-${declaration.id}`,
        description: `Dividend Declaration - ${declaration.declaration_date}`,
        source_id: declaration.id,
        source_type: 'manual',
        entries: [
          { account_code: '3002', account_name: 'Retained Earnings', debit: declaration.dividend_pool },
          { account_code: '2201', account_name: 'Dividend Payable', credit: declaration.dividend_pool }
        ]
      });
    });

    console.log('Dividend declaration confirmed and posted to accounting');
  }

  static payDividend(distributionId: string, paymentProofUrl?: string): void {
    const distribution = this.distributions.find(d => d.id === distributionId);
    if (!distribution) {
      throw new Error('Distribution not found');
    }

    distribution.is_paid = true;
    distribution.paid_on = new Date().toISOString().split('T')[0];
    distribution.payment_proof_url = paymentProofUrl;
    this.saveDistributions();

    // Post individual payment to UTS
    UniversalTransactionService.createTransaction({
      type: 'payment',
      amount: distribution.amount,
      description: `Dividend Payment - ${distribution.shareholder_name}`,
      date: distribution.paid_on!,
      payment_method: 'bank',
      reference_number: `DIV-PAY-${distribution.id}`,
      status: 'confirmed',
      company_id: localStorage.getItem('selectedCompanyId') || 'comp-001'
    });

    // Post accounting entry for dividend payment
    import('./transactionEngine').then(({ default: TransactionEngine }) => {
      TransactionEngine.postTransaction({
        date: distribution.paid_on!,
        reference: `DIV-PAY-${distribution.id}`,
        description: `Dividend Payment - ${distribution.shareholder_name}`,
        source_id: distribution.id,
        source_type: 'payment',
        entries: [
          { account_code: '2201', account_name: 'Dividend Payable', debit: distribution.amount },
          { account_code: '1001', account_name: 'Cash at Bank', credit: distribution.amount }
        ]
      });
    });

    console.log(`Dividend payment recorded for ${distribution.shareholder_name}`);
  }

  static getAllDeclarations(): DividendDeclaration[] {
    this.loadDeclarations();
    return [...this.declarations].sort((a, b) => new Date(b.declaration_date).getTime() - new Date(a.declaration_date).getTime());
  }

  static getDistributionsByDeclaration(declarationId: string): DividendDistribution[] {
    this.loadDistributions();
    return this.distributions.filter(d => d.declaration_id === declarationId);
  }

  static getDividendDistributions(declarationId: string): DividendDistribution[] {
    return this.getDistributionsByDeclaration(declarationId);
  }

  static getDividendSummary() {
    const declarations = this.getAllDeclarations();
    const totalDeclared = declarations.reduce((sum, d) => sum + d.dividend_pool, 0);
    const totalPaid = this.distributions
      .filter(d => d.is_paid)
      .reduce((sum, d) => sum + d.amount, 0);
    const pendingPayments = this.distributions
      .filter(d => !d.is_paid)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalDeclarations: declarations.length,
      totalDeclared,
      totalPaid,
      pendingPayments,
      activeDeclarations: declarations.filter(d => d.status === 'confirmed').length
    };
  }

  private static saveDeclarations(): void {
    localStorage.setItem('dividend-declarations', JSON.stringify(this.declarations));
  }

  private static loadDeclarations(): void {
    const stored = localStorage.getItem('dividend-declarations');
    if (stored) {
      this.declarations = JSON.parse(stored);
    }
  }

  private static saveDistributions(): void {
    localStorage.setItem('dividend-distributions', JSON.stringify(this.distributions));
  }

  private static loadDistributions(): void {
    const stored = localStorage.getItem('dividend-distributions');
    if (stored) {
      this.distributions = JSON.parse(stored);
    }
  }
}

export default DividendService;
