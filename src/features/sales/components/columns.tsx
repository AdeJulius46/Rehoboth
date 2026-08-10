"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { formatNaira } from "@/lib/currency";
import { SALE_STATUS_VARIANT, INVOICE_STATUS_VARIANT } from "@/lib/constants";
import { SaleDetailDialog } from "@/features/sales/components/sale-detail-dialog";
import { SaleRowActions } from "@/features/sales/components/sale-row-actions";
import type { SaleListRow } from "@/features/sales/queries";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function SaleNumberCell({ sale }: { sale: SaleListRow }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-medium text-foreground hover:text-primary hover:underline"
      >
        {sale.number}
      </button>
      <SaleDetailDialog sale={sale} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const saleColumns: ColumnDef<SaleListRow, unknown>[] = [
  {
    accessorKey: "number",
    header: () => <ColumnHeader label="Invoice No" sortKey="number" />,
    cell: ({ row }) => <SaleNumberCell sale={row.original} />,
  },
  {
    accessorKey: "date",
    header: () => <ColumnHeader label="Date" sortKey="date" />,
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    id: "customerName",
    header: "Customer",
    cell: ({ row }) => row.original.customerName,
  },
  {
    id: "agentName",
    header: "Agent",
    cell: ({ row }) => row.original.agentName || "—",
  },
  {
    accessorKey: "total",
    header: () => <ColumnHeader label="Amount" sortKey="total" />,
    cell: ({ row }) => formatNaira(row.original.total),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={STATUS_LABELS[row.original.status]} variant={SALE_STATUS_VARIANT[row.original.status]} />
    ),
  },
  {
    id: "invoiceStatus",
    header: "Invoice",
    cell: ({ row }) =>
      row.original.invoiceStatus ? (
        <StatusBadge
          label={INVOICE_STATUS_LABELS[row.original.invoiceStatus]}
          variant={INVOICE_STATUS_VARIANT[row.original.invoiceStatus]}
        />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <SaleRowActions sale={row.original} />,
  },
];
