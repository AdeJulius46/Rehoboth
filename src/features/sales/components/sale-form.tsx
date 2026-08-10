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

export type ProductPickerOption = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stockByWarehouse: Record<string, number>;
};

type LineItem = { productId: string; quantity: number; unitPrice: number; discount: number };

const PAYMENT_METHOD_ITEMS = { CASH: "Cash", TRANSFER: "Bank Transfer", CARD: "Card", POS: "POS" };
const SALE_STATUS_ITEMS = { PENDING: "Pending", COMPLETED: "Completed", CANCELLED: "Cancelled" };

export function SaleForm({
  customerOptions,
  agentOptions,
  warehouseOptions,
  productOptions,
  onSubmit,
}: {
  customerOptions: ComboboxOption[];
  agentOptions: ComboboxOption[];
  warehouseOptions: ComboboxOption[];
  productOptions: ProductPickerOption[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = React.useState("");
  const [agentId, setAgentId] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [status, setStatus] = React.useState("PENDING");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const productsById = React.useMemo(() => new Map(productOptions.map((p) => [p.id, p])), [productOptions]);

  function availableStock(productId: string) {
    if (!warehouseId) return 0;
    return productsById.get(productId)?.stockByWarehouse[warehouseId] ?? 0;
  }

  const productPickerOptions: ComboboxOption[] = productOptions
    .filter((p) => !items.some((i) => i.productId === p.id) && availableStock(p.id) > 0)
    .map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku})`,
      description: `${availableStock(p.id)} in stock · ${formatNaira(p.sellingPrice)}`,
    }));

  function handleWarehouseChange(value: string) {
    if (items.length > 0 && value !== warehouseId) {
      setItems([]);
      toast.info("Line items were cleared because the warehouse changed");
    }
    setWarehouseId(value);
  }

  function addItem(productId: string) {
    const product = productsById.get(productId);
    if (!product) return;
    setItems((prev) => [...prev, { productId, quantity: 1, unitPrice: product.sellingPrice, discount: 0 }]);
  }

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!customerId) return setFormError("Select a customer");
    if (!warehouseId) return setFormError("Select a warehouse");
    if (items.length === 0) return setFormError("Add at least one product");

    const formData = new FormData();
    formData.set("customerId", customerId);
    if (agentId) formData.set("agentId", agentId);
    formData.set("warehouseId", warehouseId);
    formData.set("date", date);
    if (paymentMethod) formData.set("paymentMethod", paymentMethod);
    formData.set("status", status);
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
          <h1 className="text-xl font-semibold text-foreground">Create New Sale</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below and create new sales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Sale"}
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
            <Label htmlFor="sale-date">Date</Label>
            <Input id="sale-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Warehouse</Label>
            <Combobox
              options={warehouseOptions}
              value={warehouseId}
              onValueChange={handleWarehouseChange}
              placeholder="Select warehouse"
              searchPlaceholder="Search warehouses..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Payment Method</Label>
            <Select
              items={PAYMENT_METHOD_ITEMS}
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value ?? "")}
            >
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
            <Label>Sales Status</Label>
            <Select items={SALE_STATUS_ITEMS} value={status} onValueChange={(value) => setStatus(value ?? "PENDING")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sales status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SALE_STATUS_ITEMS).map(([value, label]) => (
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
            placeholder={warehouseId ? "Search products by name or SKU..." : "Select a warehouse first"}
            searchPlaceholder="Search products..."
          />
        </div>

        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Available Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const product = productsById.get(item.productId);
                const stock = availableStock(item.productId);
                return (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium text-foreground">{product?.name}</TableCell>
                    <TableCell>{stock}</TableCell>
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
                        max={stock}
                        className="w-20"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, { quantity: Math.max(1, Math.min(Number(e.target.value), stock)) })
                        }
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
                );
              })}
            </TableBody>
          </Table>
        ) : null}

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            Total Items: <span className="font-medium text-foreground">{totalQuantity}</span>
          </span>
          <span className="text-muted-foreground">
            Total Amount: <span className="font-medium text-foreground">{formatNaira(totalAmount)}</span>
          </span>
        </div>
      </Card>
    </form>
  );
}
