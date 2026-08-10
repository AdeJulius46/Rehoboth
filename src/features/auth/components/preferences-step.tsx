"use client";

import * as React from "react";
import { User, Users, ShoppingCart, Warehouse, Calculator, Circle, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepBadge } from "@/features/auth/components/step-badge";
import type { Role } from "@/lib/constants";
import type { PreferencesInput } from "@/features/auth/schema";

const ROLE_OPTIONS: { role: Role | "OTHER"; label: string; description: string; icon: LucideIcon }[] = [
  { role: "ADMIN", label: "Administrator", description: "Full access to all features and settings.", icon: User },
  { role: "MANAGER", label: "Manager", description: "Manage teams projects and reports.", icon: Users },
  { role: "STAFF", label: "Sales Agent", description: "Handle sales, customers and transactions.", icon: ShoppingCart },
  { role: "MANAGER", label: "Warehouse Manager", description: "Manage inventory and warehouses", icon: Warehouse },
  { role: "STAFF", label: "Accountant", description: "Manage finances, invoices and report.", icon: Calculator },
  { role: "STAFF", label: "Other", description: "Other role in the organization", icon: Circle },
];

export function PreferencesStep({
  totalSteps,
  isSubmitting,
  onContinue,
}: {
  totalSteps: number;
  isSubmitting?: boolean;
  onContinue: (data: PreferencesInput) => void;
}) {
  const [selected, setSelected] = React.useState(0);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onContinue({ requestedRole: ROLE_OPTIONS[selected].role === "OTHER" ? "STAFF" : ROLE_OPTIONS[selected].role });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StepBadge step={3} total={totalSteps} label="Preferences" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Set up your preferences</h1>
        <p className="text-sm text-muted-foreground">Customize your experience.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isSelected = index === selected;
          return (
            <button
              type="button"
              key={option.label}
              onClick={() => setSelected(index)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "mb-3 flex size-9 items-center justify-center rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4.5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          );
        })}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Continue"}
      </Button>
    </form>
  );
}
