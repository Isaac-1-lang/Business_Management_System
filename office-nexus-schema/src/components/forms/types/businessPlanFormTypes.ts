
export interface BusinessPlanFormData {
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
  status: "draft" | "active" | "archived";
}
