import { History } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STOCK_MOVEMENT_REASON_VARIANT } from "@/lib/constants";
import type { StockMovementRow } from "@/features/stock-movements/queries";

const REASON_LABELS: Record<string, string> = {
  SALE: "Sale",
  SALE_CANCELLED: "Sale Cancelled",
  SALE_REINSTATED: "Sale Reinstated",
  SALE_DELETED: "Sale Deleted",
  RESTOCK: "Restock",
  MANUAL_ADJUSTMENT: "Manual Adjustment",
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Shows one of `Warehouse` or `Product` as its own column, inferred from
 * whichever the rows carry — product-scoped rows (one product, many
 * warehouses) name the warehouse, warehouse-scoped rows (one warehouse, many
 * products) name the product.
 */
export function StockHistory({ movements }: { movements: StockMovementRow[] }) {
  if (movements.length === 0) {
    return (
      <Card className="p-0">
        <div className="p-5">
          <EmptyState
            icon={History}
            title="No stock movements yet"
            description="Sales, restocks and manual adjustments will show up here."
          />
        </div>
      </Card>
    );
  }

  const showProductColumn = movements.some((m) => m.productName !== null);

  return (
    <Card className="gap-4 p-0">
      <div className="p-5 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Resulting Qty</TableHead>
              <TableHead>{showProductColumn ? "Product" : "Warehouse"}</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="text-muted-foreground">{formatDateTime(movement.createdAt)}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={REASON_LABELS[movement.reason] ?? movement.reason}
                    variant={STOCK_MOVEMENT_REASON_VARIANT[movement.reason] ?? "neutral"}
                  />
                </TableCell>
                <TableCell className={movement.delta > 0 ? "text-success" : "text-danger"}>
                  {movement.delta > 0 ? "+" : ""}
                  {movement.delta} {movement.unit}
                </TableCell>
                <TableCell>
                  {movement.quantityAfter} {movement.unit}
                </TableCell>
                <TableCell>{showProductColumn ? movement.productName : movement.warehouseName}</TableCell>
                <TableCell className="text-muted-foreground">{movement.saleNumber ?? movement.note ?? "—"}</TableCell>
                <TableCell>{movement.createdByName ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="h-5" />
    </Card>
  );
}
