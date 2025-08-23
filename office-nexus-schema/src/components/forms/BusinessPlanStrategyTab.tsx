import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { BusinessPlanFormData } from "./types/businessPlanFormTypes";

interface BusinessPlanStrategyTabProps {
  control: Control<BusinessPlanFormData>;
}

export function BusinessPlanStrategyTab({ control }: BusinessPlanStrategyTabProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="mission_statement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mission Statement</FormLabel>
            <FormControl>
              <Textarea placeholder="Define your company's mission and purpose..." rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vision_statement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vision Statement</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your long-term vision..." rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="strategic_goals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Strategic Goals</FormLabel>
            <FormControl>
              <Textarea placeholder="List your key strategic objectives..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
