import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { BusinessPlanFormData } from "./types/businessPlanFormTypes";

interface BusinessPlanFinancialTabProps {
  control: Control<BusinessPlanFormData>;
}

export function BusinessPlanFinancialTab({ control }: BusinessPlanFinancialTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="financial_projections"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Financial Projections</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Year 1 Revenue Target: &#10;Year 2 Revenue Target: &#10;Year 3 Revenue Target: &#10;&#10;Key Financial Metrics:&#10;- " 
                rows={6} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
