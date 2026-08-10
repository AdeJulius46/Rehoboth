"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { formatNaira } from "@/lib/currency";
import { PAYMENT_STATUS_VARIANT } from "@/lib/constants";
import { PaymentDetailDialog } from "@/features/payments/components/payment-detail-dialog";
import { PaymentRowActions } from "@/features/payments/components/payment-row-actions";
import type { PaymentListRow } from "@/features/payments/queries";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Paid",
  FAILED: "Failed",
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Bank Transfer",
  CARD: "Card",
  POS: "POS",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function PaymentReferenceCell({ payment }: { payment: PaymentListRow }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-medium text-foreground hover:text-primary hover:underline"
      >
        {payment.reference}
      </button>
      <PaymentDetailDialog payment={payment} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const paymentColumns: ColumnDef<PaymentListRow, unknown>[] = [
  {
    accessorKey: "reference",
    header: () => <ColumnHeader label="Payment ID" sortKey="reference" />,
    cell: ({ row }) => <PaymentReferenceCell payment={row.original} />,
  },
  {
    id: "invoiceNumber",
    header: "Invoice No",
    cell: ({ row }) => row.original.invoiceNumber || "—",
  },
  {
    id: "customerName",
    header: "Customer",
    cell: ({ row }) => row.original.customerName,
  },
  {
    accessorKey: "date",
    header: () => <ColumnHeader label="Date" sortKey="date" />,
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "amount",
    header: () => <ColumnHeader label="Amount" sortKey="amount" />,
    cell: ({ row }) => formatNaira(row.original.amount),
  },
  {
    accessorKey: "method",
    header: "Payment Method",
    cell: ({ row }) => METHOD_LABELS[row.original.method],
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={STATUS_LABELS[row.original.status]} variant={PAYMENT_STATUS_VARIANT[row.original.status]} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PaymentRowActions payment={row.original} />,
  },
];
