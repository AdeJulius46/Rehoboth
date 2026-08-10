import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/lib/constants";

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  label,
  variant,
  className,
}: {
  label: string;
  variant: StatusVariant;
  className?: string;
}) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
