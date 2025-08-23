
import { Button } from "@/components/ui/button";

interface BusinessPlanFormActionsProps {
  onCancel?: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function BusinessPlanFormActions({ onCancel, isSubmitting, isEditing }: BusinessPlanFormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-6 border-t">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : isEditing ? "Update Plan" : "Create Plan"}
      </Button>
    </div>
  );
}
