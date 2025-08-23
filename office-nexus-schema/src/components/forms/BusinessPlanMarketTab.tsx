import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { BusinessPlanFormData } from "./types/businessPlanFormTypes";

interface BusinessPlanMarketTabProps {
  control: Control<BusinessPlanFormData>;
}

export function BusinessPlanMarketTab({ control }: BusinessPlanMarketTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="market_analysis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Market Analysis</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your target market, size, and opportunities..." rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
