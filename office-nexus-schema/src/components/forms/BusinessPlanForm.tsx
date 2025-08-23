import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target } from "lucide-react";
import BusinessPlanService, { BusinessPlan } from "@/services/businessPlanService";
import { useToast } from "@/hooks/use-toast";
import { BusinessPlanFormBasicInfo } from "./BusinessPlanFormBasicInfo";
import { BusinessPlanStrategyTab } from "./BusinessPlanStrategyTab";
import { BusinessPlanAnalysisTab } from "./BusinessPlanAnalysisTab";
import { BusinessPlanFinancialTab } from "./BusinessPlanFinancialTab";
import { BusinessPlanMarketTab } from "./BusinessPlanMarketTab";
import { BusinessPlanFormActions } from "./BusinessPlanFormActions";
import { BusinessPlanFormData } from "./types/businessPlanFormTypes";

const businessPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().min(2020).max(2030),
  description: z.string().optional(),
  strategic_goals: z.string().optional(),
  mission_statement: z.string().optional(),
  vision_statement: z.string().optional(),
  swot_analysis: z.string().optional(),
  financial_projections: z.string().optional(),
  market_analysis: z.string().optional(),
  competitive_analysis: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
});

interface BusinessPlanFormProps {
  businessPlan?: BusinessPlan;
  onSubmit?: (plan: BusinessPlan) => void;
  onCancel?: () => void;
}

export function BusinessPlanForm({ businessPlan, onSubmit, onCancel }: BusinessPlanFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BusinessPlanFormData>({
    resolver: zodResolver(businessPlanSchema),
    defaultValues: {
      title: businessPlan?.title || "",
      year: businessPlan?.year || new Date().getFullYear(),
      description: businessPlan?.description || "",
      strategic_goals: businessPlan?.strategic_goals || "",
      mission_statement: businessPlan?.mission_statement || "",
      vision_statement: businessPlan?.vision_statement || "",
      swot_analysis: businessPlan?.swot_analysis || "",
      financial_projections: businessPlan?.financial_projections || "",
      market_analysis: businessPlan?.market_analysis || "",
      competitive_analysis: businessPlan?.competitive_analysis || "",
      status: businessPlan?.status || "draft",
    },
  });

  const handleSubmit = async (data: BusinessPlanFormData) => {
    setIsSubmitting(true);
    try {
      let result: BusinessPlan;
      
      if (businessPlan) {
        result = BusinessPlanService.updateBusinessPlan(businessPlan.id, {
          title: data.title,
          year: data.year,
          description: data.description,
          strategic_goals: data.strategic_goals,
          mission_statement: data.mission_statement,
          vision_statement: data.vision_statement,
          swot_analysis: data.swot_analysis,
          financial_projections: data.financial_projections,
          market_analysis: data.market_analysis,
          competitive_analysis: data.competitive_analysis,
          status: data.status,
          uploaded_by: businessPlan.uploaded_by,
        })!;
        toast({
          title: "Success",
          description: "Business plan updated successfully",
        });
      } else {
        result = BusinessPlanService.createBusinessPlan({
          title: data.title,
          year: data.year,
          description: data.description,
          strategic_goals: data.strategic_goals,
          mission_statement: data.mission_statement,
          vision_statement: data.vision_statement,
          swot_analysis: data.swot_analysis,
          financial_projections: data.financial_projections,
          market_analysis: data.market_analysis,
          competitive_analysis: data.competitive_analysis,
          status: data.status,
          uploaded_by: "Current User", // In real app, get from auth context
        });
        toast({
          title: "Success",
          description: "Business plan created successfully",
        });
      }

      onSubmit?.(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {businessPlan ? "Edit Business Plan" : "Create New Business Plan"}
        </CardTitle>
        <CardDescription>
          {businessPlan ? "Update your business plan details" : "Create a comprehensive business plan for strategic planning and compliance"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BusinessPlanFormBasicInfo control={form.control} />

            <Tabs defaultValue="strategy" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>

              <TabsContent value="strategy">
                <BusinessPlanStrategyTab control={form.control} />
              </TabsContent>

              <TabsContent value="analysis">
                <BusinessPlanAnalysisTab control={form.control} />
              </TabsContent>

              <TabsContent value="financial">
                <BusinessPlanFinancialTab control={form.control} />
              </TabsContent>

              <TabsContent value="market">
                <BusinessPlanMarketTab control={form.control} />
              </TabsContent>
            </Tabs>

            <BusinessPlanFormActions 
              onCancel={onCancel}
              isSubmitting={isSubmitting}
              isEditing={!!businessPlan}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
