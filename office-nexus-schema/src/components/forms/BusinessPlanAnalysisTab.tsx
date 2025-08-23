import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { BusinessPlanFormData } from "./types/businessPlanFormTypes";

interface BusinessPlanAnalysisTabProps {
  control: Control<BusinessPlanFormData>;
}

export function BusinessPlanAnalysisTab({ control }: BusinessPlanAnalysisTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="swot_analysis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SWOT Analysis</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Strengths:&#10;- &#10;&#10;Weaknesses:&#10;- &#10;&#10;Opportunities:&#10;- &#10;&#10;Threats:&#10;- " 
                rows={8} 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Analyze your Strengths, Weaknesses, Opportunities, and Threats
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="competitive_analysis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Competitive Analysis</FormLabel>
            <FormControl>
              <Textarea placeholder="Analyze your competitors and market positioning..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
