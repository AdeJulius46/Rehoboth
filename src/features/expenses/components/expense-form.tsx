"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TextInput } from "@/components/ui/text-input";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseSchema, type ExpenseFormInput, type ExpenseInput } from "@/features/expenses/schema";
import { EXPENSE_CATEGORIES } from "@/features/expenses/constants";

const PAYMENT_METHOD_ITEMS = { CASH: "Cash", TRANSFER: "Bank Transfer", CARD: "Card", POS: "POS" };

export function ExpenseForm({
  mode,
  defaultValues,
  paidByOptions,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ExpenseFormInput>;
  paidByOptions: ComboboxOption[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "", paidById: "", status: "PENDING", amount: 0, ...defaultValues },
  });

  const category = watch("category");
  const paidById = watch("paidById");
  const paymentMethod = watch("paymentMethod");

  async function submit(data: ExpenseInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") formData.set(key, String(value));
    });

    const result = await onSubmit(formData);
    if (result && !result.success) {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Add Expenses" : "Edit Expense"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and create new expense" : "Update the expense's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create new" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Expense Category</Label>
            <Select
              items={Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, c]))}
              value={category}
              onValueChange={(value) => setValue("category", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? <p className="text-xs text-destructive">{errors.category.message}</p> : null}
          </div>

          <TextInput
            label="Description"
            placeholder="Enter Description"
            error={errors.description?.message}
            {...register("description")}
          />

          <TextInput
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount"
            error={errors.amount?.message}
            {...register("amount")}
          />

          <TextInput label="Expense Date" type="date" error={errors.date?.message} {...register("date")} />

          <div className="grid gap-1.5">
            <Label>Paid By</Label>
            <Combobox
              options={paidByOptions}
              value={paidById}
              onValueChange={(value) => setValue("paidById", value)}
              placeholder="Select Person"
              searchPlaceholder="Search staff..."
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Payment Method</Label>
            <Select
              items={PAYMENT_METHOD_ITEMS}
              value={paymentMethod}
              onValueChange={(value) => setValue("paymentMethod", value as ExpenseInput["paymentMethod"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </form>
  );
}
