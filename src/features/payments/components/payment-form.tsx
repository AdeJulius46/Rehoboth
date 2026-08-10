"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNaira } from "@/lib/currency";

export type InvoiceOption = { id: string; number: string; customerId: string; total: number };

const PAYMENT_METHOD_ITEMS = { CASH: "Cash", TRANSFER: "Bank Transfer", CARD: "Card", POS: "POS" };

export function PaymentForm({
  customerOptions,
  invoiceOptions,
  onSubmit,
}: {
  customerOptions: ComboboxOption[];
  invoiceOptions: InvoiceOption[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = React.useState("");
  const [invoiceId, setInvoiceId] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [method, setMethod] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const invoicePickerOptions: ComboboxOption[] = invoiceOptions
    .filter((invoice) => !customerId || invoice.customerId === customerId)
    .map((invoice) => ({ value: invoice.id, label: invoice.number, description: formatNaira(invoice.total) }));

  function handleCustomerChange(value: string) {
    if (invoiceId) {
      const invoice = invoiceOptions.find((i) => i.id === invoiceId);
      if (invoice && invoice.customerId !== value) setInvoiceId("");
    }
    setCustomerId(value);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!customerId) return setFormError("Select a customer");
    if (!method) return setFormError("Select a payment method");
    if (amount <= 0) return setFormError("Enter a payment amount");

    const formData = new FormData();
    formData.set("customerId", customerId);
    if (invoiceId) formData.set("invoiceId", invoiceId);
    formData.set("amount", String(amount));
    formData.set("method", method);
    if (reference) formData.set("reference", reference);
    formData.set("date", date);
    if (notes) formData.set("notes", notes);

    setIsSubmitting(true);
    const result = await onSubmit(formData);
    setIsSubmitting(false);
    if (result && !result.success) {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Record Payment</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below and create new payment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create new"}
          </Button>
        </div>
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <Combobox
              options={customerOptions}
              value={customerId}
              onValueChange={handleCustomerChange}
              placeholder="Select customer"
              searchPlaceholder="Search customers..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Invoice</Label>
            <Combobox
              options={invoicePickerOptions}
              value={invoiceId}
              onValueChange={setInvoiceId}
              placeholder="Select invoice"
              searchPlaceholder="Search invoices..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <Input
              id="payment-amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Payment Method</Label>
            <Select items={PAYMENT_METHOD_ITEMS} value={method} onValueChange={(value) => setMethod(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
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
          <div className="grid gap-1.5">
            <Label htmlFor="reference">Transaction Reference</Label>
            <Input
              id="reference"
              placeholder="Auto generated"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="payment-date">Payment Date</Label>
            <Input id="payment-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Card>
    </form>
  );
}
