import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delta,
  caption,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  delta?: { value: string; direction: "up" | "down" };
  caption?: string;
}) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
            iconClassName,
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      {delta ? (
        <div className="flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              delta.direction === "up" ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {delta.value}
          </span>
          {caption ? <span className="text-muted-foreground">{caption}</span> : null}
        </div>
      ) : caption ? (
        <span className="text-xs text-muted-foreground">{caption}</span>
      ) : null}
    </Card>
  );
}
