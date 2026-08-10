"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { formatNaira } from "@/lib/currency";
import { INVOICE_STATUS_VARIANT } from "@/lib/constants";
import { InvoiceRowActions } from "@/features/invoices/components/invoice-row-actions";
import type { InvoiceListRow } from "@/features/invoices/queries";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export const invoiceColumns: ColumnDef<InvoiceListRow, unknown>[] = [
  {
    accessorKey: "number",
    header: () => <ColumnHeader label="Invoice No" sortKey="number" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.number}</span>,
  },
  {
    accessorKey: "issueDate",
    header: () => <ColumnHeader label="Date" sortKey="issueDate" />,
    cell: ({ row }) => formatDate(row.original.issueDate),
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
    accessorKey: "dueDate",
    header: () => <ColumnHeader label="Due Date" sortKey="dueDate" />,
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: "total",
    header: () => <ColumnHeader label="Amount" sortKey="total" />,
    cell: ({ row }) => formatNaira(row.original.total),
  },
  {
    id: "paidAmount",
    header: "Paid Amount",
    cell: ({ row }) => formatNaira(row.original.paidAmount),
  },
  {
    id: "dueAmount",
    header: "Due Amount",
    cell: ({ row }) => formatNaira(row.original.dueAmount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={STATUS_LABELS[row.original.status]} variant={INVOICE_STATUS_VARIANT[row.original.status]} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <InvoiceRowActions id={row.original.id} />,
  },
];
