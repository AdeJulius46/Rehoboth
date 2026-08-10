"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { CustomerPicker } from "@/features/customers/components/customer-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira } from "@/lib/currency";

export type ProductPickerOption = { id: string; name: string; sku: string; sellingPrice: number };

type LineItem = { productId?: string; description: string; quantity: number; unitPrice: number; discount: number };

const PAYMENT_TERM_ITEMS = {
  "Due on Receipt": "Due on Receipt",
  "Net 15": "Net 15",
  "Net 30": "Net 30",
  "Net 60": "Net 60",
};

export function InvoiceForm({
  customerOptions,
  agentOptions,
  productOptions,
  onSubmit,
}: {
  customerOptions: ComboboxOption[];
  agentOptions: ComboboxOption[];
  productOptions: ProductPickerOption[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = React.useState("");
  const [agentId, setAgentId] = React.useState("");
  const [issueDate, setIssueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = React.useState("");
  const [paymentTerm, setPaymentTerm] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const productsById = React.useMemo(() => new Map(productOptions.map((p) => [p.id, p])), [productOptions]);

  const productPickerOptions: ComboboxOption[] = productOptions.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku})`,
    description: formatNaira(p.sellingPrice),
  }));

  function addItem(productId: string) {
    const product = productsById.get(productId);
    if (!product) return;
    setItems((prev) => [
      ...prev,
      { productId: product.id, description: product.name, quantity: 1, unitPrice: product.sellingPrice, discount: 0 },
    ]);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const totalAmount = subtotal - totalDiscount;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!customerId) return setFormError("Select a customer");
    if (!dueDate) return setFormError("Select a due date");
    if (items.length === 0) return setFormError("Add at least one product");

    const formData = new FormData();
    formData.set("customerId", customerId);
    if (agentId) formData.set("agentId", agentId);
    formData.set("issueDate", issueDate);
    formData.set("dueDate", dueDate);
    if (paymentTerm) formData.set("paymentTerm", paymentTerm);
    if (notes) formData.set("notes", notes);
    formData.set("items", JSON.stringify(items));

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
          <h1 className="text-xl font-semibold text-foreground">Create New Invoice</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below and create new invoice</p>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <CustomerPicker options={customerOptions} value={customerId} onValueChange={setCustomerId} />
          </div>
          <div className="grid gap-1.5">
            <Label>Agent</Label>
            <Combobox
              options={agentOptions}
              value={agentId}
              onValueChange={setAgentId}
              placeholder="Select agent"
              searchPlaceholder="Search agents..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="issue-date">Start Date</Label>
            <Input id="issue-date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="due-date">Due Date</Label>
            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Payment Term</Label>
            <Select
              items={PAYMENT_TERM_ITEMS}
              value={paymentTerm}
              onValueChange={(value) => setPaymentTerm(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment term" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_TERM_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Add Products</Label>
          <Combobox
            options={productPickerOptions}
            value=""
            onValueChange={addItem}
            placeholder="Search products by name or code..."
            searchPlaceholder="Search products..."
          />
        </div>

        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">
                    {item.productId ? productsById.get(item.productId)?.name : "—"}
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-40"
                      value={item.description}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      className="w-28"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value)) })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      className="w-24"
                      value={item.discount}
                      onChange={(e) => updateItem(index, { discount: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell>{formatNaira(item.quantity * item.unitPrice - item.discount)}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(index)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Description</Label>
            <Textarea
              id="notes"
              placeholder="Enter project description (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Summary</p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatNaira(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-foreground">{formatNaira(totalDiscount)}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">Total Amount</span>
              <span className="text-foreground">{formatNaira(totalAmount)}</span>
            </div>
          </div>
        </div>
      </Card>
    </form>
  );
}
