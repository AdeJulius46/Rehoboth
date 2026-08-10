"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setStockQuantity, addProductStock } from "@/features/warehouses/actions";

export type StockRow = {
  id: string;
  quantity: number;
  product: { id: string; name: string; sku: string; unit: string; reorderLevel: number };
};

function stockStatus(quantity: number, reorderLevel: number) {
  if (quantity <= 0) return { label: "Out of Stock", variant: "danger" as const };
  if (quantity <= reorderLevel) return { label: "Low Stock", variant: "warning" as const };
  return { label: "In Stock", variant: "success" as const };
}

function AdjustStockDialog({
  stock,
  open,
  onOpenChange,
}: {
  stock: StockRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock — {stock?.product.name}</DialogTitle>
        </DialogHeader>
        {stock ? (
          <AdjustStockForm key={stock.id} stock={stock} onSaved={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AdjustStockForm({ stock, onSaved }: { stock: StockRow; onSaved: () => void }) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(stock.quantity);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await setStockQuantity(stock.id, quantity);
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${stock.product.name} quantity updated`);
    onSaved();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="adjust-quantity">Quantity ({stock.product.unit})</Label>
        <Input
          id="adjust-quantity"
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
          required
        />
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddProductDialog({
  warehouseId,
  availableProducts,
  open,
  onOpenChange,
}: {
  warehouseId: string;
  availableProducts: ComboboxOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [productId, setProductId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function reset() {
    setProductId("");
    setQuantity(1);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!productId) {
      setError("Select a product");
      return;
    }
    setIsSubmitting(true);
    const result = await addProductStock(warehouseId, productId, quantity);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    toast.success("Product added to warehouse");
    reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product to Warehouse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label>Product</Label>
            <Combobox
              options={availableProducts}
              value={productId}
              onValueChange={setProductId}
              placeholder="Select product"
              searchPlaceholder="Search products..."
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="add-quantity">Quantity</Label>
            <Input
              id="add-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StockSummary({
  warehouseId,
  stock,
  availableProducts,
}: {
  warehouseId: string;
  stock: StockRow[];
  availableProducts: ComboboxOption[];
}) {
  const [adjusting, setAdjusting] = React.useState<StockRow | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 pb-4">
        <h3 className="font-semibold text-foreground">Stock Summary</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus />
          Add Product
        </Button>
      </div>
      <div className="p-5 pt-0">
        {stock.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.map((row) => {
                const status = stockStatus(row.quantity, row.product.reorderLevel);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">{row.product.name}</TableCell>
                    <TableCell>{row.product.sku}</TableCell>
                    <TableCell>
                      {row.quantity} {row.product.unit}
                    </TableCell>
                    <TableCell>{row.product.reorderLevel}</TableCell>
                    <TableCell>
                      <StatusBadge label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setAdjusting(row)}>
                        <Pencil />
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Package}
            title="No stock recorded"
            description="Add a product to start tracking stock in this warehouse."
          />
        )}
      </div>

      <AdjustStockDialog stock={adjusting} open={adjusting !== null} onOpenChange={(open) => !open && setAdjusting(null)} />
      <AddProductDialog
        warehouseId={warehouseId}
        availableProducts={availableProducts}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </Card>
  );
}
