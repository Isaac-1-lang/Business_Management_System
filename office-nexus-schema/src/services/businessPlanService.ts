
export interface BusinessPlan {
  id: string;
  title: string;
  year: number;
  description?: string;
  strategic_goals?: string;
  mission_statement?: string;
  vision_statement?: string;
  swot_analysis?: string;
  financial_projections?: string;
  market_analysis?: string;
  competitive_analysis?: string;
  file_path?: string;
  file_name?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
}

class BusinessPlanService {
  private static businessPlans: BusinessPlan[] = [
    {
      id: 'bp-001',
      title: '2024 Strategic Business Plan',
      year: 2024,
      description: 'Comprehensive business plan for 2024 expansion',
      strategic_goals: 'Expand market presence by 30%, Launch 2 new product lines, Increase revenue by 25%',
      mission_statement: 'To provide exceptional compliance and business management solutions',
      vision_statement: 'To become Rwanda\'s leading business compliance platform',
      swot_analysis: 'Strengths: Strong local knowledge, Experienced team\nWeaknesses: Limited marketing budget\nOpportunities: Growing SME sector\nThreats: Competition from international firms',
      financial_projections: 'Year 1: 50M RWF revenue target\nYear 2: 75M RWF revenue target\nYear 3: 100M RWF revenue target',
      market_analysis: 'Target market: SMEs and mid-size companies in Rwanda',
      competitive_analysis: 'Main competitors: Local accounting firms, International consulting companies',
      uploaded_by: 'John Doe',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-06-15T14:30:00Z',
      version: 2,
      status: 'active'
    }
  ];

  static getAllBusinessPlans(): BusinessPlan[] {
    return [...this.businessPlans].sort((a, b) => b.year - a.year);
  }

  static getBusinessPlansByYear(year: number): BusinessPlan[] {
    return this.businessPlans.filter(plan => plan.year === year);
  }

  static getActiveBusinessPlan(): BusinessPlan | null {
    return this.businessPlans.find(plan => plan.status === 'active') || null;
  }

  static createBusinessPlan(data: Omit<BusinessPlan, 'id' | 'created_at' | 'updated_at' | 'version'>): BusinessPlan {
    const newPlan: BusinessPlan = {
      ...data,
      id: `bp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1
    };

    this.businessPlans.push(newPlan);
    console.log('Created new business plan:', newPlan.title);
    return newPlan;
  }

  static updateBusinessPlan(id: string, updates: Partial<BusinessPlan>): BusinessPlan | null {
    const planIndex = this.businessPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return null;

    const updatedPlan = {
      ...this.businessPlans[planIndex],
      ...updates,
      updated_at: new Date().toISOString(),
      version: this.businessPlans[planIndex].version + 1
    };

    this.businessPlans[planIndex] = updatedPlan;
    console.log('Updated business plan:', updatedPlan.title);
    return updatedPlan;
  }

  static deleteBusinessPlan(id: string): boolean {
    const planIndex = this.businessPlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return false;

    this.businessPlans.splice(planIndex, 1);
    console.log('Deleted business plan with id:', id);
    return true;
  }

  static archiveBusinessPlan(id: string): boolean {
    const plan = this.businessPlans.find(plan => plan.id === id);
    if (!plan) return false;

    plan.status = 'archived';
    plan.updated_at = new Date().toISOString();
    console.log('Archived business plan:', plan.title);
    return true;
  }

  static setActiveBusinessPlan(id: string): boolean {
    // First, set all plans to archived
    this.businessPlans.forEach(plan => {
      if (plan.status === 'active') {
        plan.status = 'archived';
      }
    });

    // Then set the selected plan as active
    const plan = this.businessPlans.find(plan => plan.id === id);
    if (!plan) return false;

    plan.status = 'active';
    plan.updated_at = new Date().toISOString();
    console.log('Set active business plan:', plan.title);
    return true;
  }

  static getYearsSummary(): Array<{ year: number; planCount: number; hasActive: boolean }> {
    const yearMap = new Map<number, { count: number; hasActive: boolean }>();
    
    this.businessPlans.forEach(plan => {
      const existing = yearMap.get(plan.year) || { count: 0, hasActive: false };
      yearMap.set(plan.year, {
        count: existing.count + 1,
        hasActive: existing.hasActive || plan.status === 'active'
      });
    });

    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        planCount: data.count,
        hasActive: data.hasActive
      }))
      .sort((a, b) => b.year - a.year);
  }
}

export default BusinessPlanService;
