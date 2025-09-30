import UniversalTransactionService from './universalTransactionService';
import DataIntegrationService from './dataIntegrationService';
import { apiService } from './apiService';

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

  static async createDividendDeclaration(data: Omit<DividendDeclaration, 'id' | 'created_at' | 'dividend_pool'>): Promise<DividendDeclaration | null> {
    const res = await apiService.createDividendDeclaration(data);
    if (res.success && res.data?.declaration) {
      return res.data.declaration as DividendDeclaration;
    }
    console.error('Failed to create dividend declaration:', res.error || res.message);
    return null;
  }

  static async calculateDividendDistribution(declarationId: string): Promise<DividendDistribution[]> {
    // Use directors as shareholders source
    const shareholders = DataIntegrationService.getDirectorsData()
      .filter((p: any) => p.shares && parseFloat(p.shares) > 0)
      .map((p: any) => ({
        shareholder_id: String(p.id),
        shareholder_name: p.name,
        shares_held_at_time: Number(p.shares)
      }));

    const res = await apiService.calculateDividendDistributions(declarationId, shareholders);
    if (res.success && res.data?.distributions) {
      return res.data.distributions as DividendDistribution[];
    }
    console.error('Failed to calculate distributions:', res.error || res.message);
    return [];
  }

  static async confirmDividendDeclaration(declarationId: string): Promise<boolean> {
    const res = await apiService.confirmDividendDeclaration(declarationId);
    if (res.success) {
      console.log('Dividend declaration confirmed');
      return true;
    }
    console.error('Failed to confirm declaration:', res.error || res.message);
    return false;
  }

  static async payDividend(distributionId: string, paymentProofUrl?: string): Promise<boolean> {
    const res = await apiService.payDividend(distributionId, paymentProofUrl);
    if (res.success) {
      // Also create a payment transaction
      const dist = res.data?.distribution as DividendDistribution;
      if (dist?.amount && dist?.paid_on) {
        await UniversalTransactionService.createTransaction({
          type: 'payment',
          amount: dist.amount,
          description: `Dividend Payment - ${dist.shareholder_name}`,
          date: dist.paid_on,
          payment_method: 'bank',
          reference_number: `DIV-PAY-${dist.id}`,
          status: 'confirmed',
        } as any);
      }
      return true;
    }
    console.error('Failed to pay dividend:', res.error || res.message);
    return false;
  }

  static async getAllDeclarations(): Promise<DividendDeclaration[]> {
    const res = await apiService.getDividendDeclarations();
    if (res.success && res.data?.declarations) {
      return res.data.declarations as DividendDeclaration[];
    }
    console.error('Failed to fetch dividend declarations:', res.error || res.message);
    return [];
  }

  static async getDistributionsByDeclaration(declarationId: string): Promise<DividendDistribution[]> {
    const res = await apiService.getDividendDistributions(declarationId);
    if (res.success && res.data?.distributions) {
      return res.data.distributions as DividendDistribution[];
    }
    console.error('Failed to fetch distributions:', res.error || res.message);
    return [];
  }

  static async getDividendDistributions(declarationId: string): Promise<DividendDistribution[]> {
    return this.getDistributionsByDeclaration(declarationId);
  }

  static async getDividendSummary() {
    const declarations = await this.getAllDeclarations();
    const totalDeclared = declarations.reduce((sum, d) => sum + d.dividend_pool, 0);
    // For paid/pending, fetch all distributions per declaration
    let totalPaid = 0;
    let pendingPayments = 0;
    for (const d of declarations) {
      const dists = await this.getDistributionsByDeclaration(d.id);
      totalPaid += dists.filter(x => x.is_paid).reduce((s, x) => s + x.amount, 0);
      pendingPayments += dists.filter(x => !x.is_paid).reduce((s, x) => s + x.amount, 0);
    }
    return {
      totalDeclarations: declarations.length,
      totalDeclared,
      totalPaid,
      pendingPayments,
      activeDeclarations: declarations.filter(d => d.status === 'confirmed').length
    };
  }

  private static saveDeclarations(): void {}

  private static loadDeclarations(): void {}

  private static saveDistributions(): void {}

  private static loadDistributions(): void {}
}

export default DividendService;
