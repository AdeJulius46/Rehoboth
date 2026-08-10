"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { QuickAddCustomerDialog } from "@/features/customers/components/quick-add-customer-dialog";

export function CustomerPicker({
  options,
  value,
  onValueChange,
}: {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [localOptions, setLocalOptions] = React.useState(options);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleCreated(customer: { id: string; name: string }) {
    setLocalOptions((prev) => [{ value: customer.id, label: customer.name }, ...prev]);
    onValueChange(customer.id);
    setDialogOpen(false);
  }

  return (
    <div className="flex gap-2">
      <Combobox
        options={localOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder="Select customer"
        searchPlaceholder="Search customers..."
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setDialogOpen(true)}
        aria-label="Add new customer"
      >
        <Plus />
      </Button>

      <QuickAddCustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={handleCreated} />
    </div>
  );
}
