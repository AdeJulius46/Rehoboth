"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { EXPENSE_STATUS_VARIANT } from "@/lib/constants";
import { deleteExpense } from "@/features/expenses/actions";
import type { ExpenseListRow } from "@/features/expenses/queries";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Paid",
  REJECTED: "Rejected",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export const expenseColumns: ColumnDef<ExpenseListRow, unknown>[] = [
  {
    accessorKey: "number",
    header: () => <ColumnHeader label="Expenses ID" sortKey="number" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.number}</span>,
  },
  {
    accessorKey: "date",
    header: () => <ColumnHeader label="Date" sortKey="date" />,
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: () => <ColumnHeader label="Amount" sortKey="amount" />,
    cell: ({ row }) => formatNaira(row.original.amount),
  },
  {
    id: "paidByName",
    header: "Paid By",
    cell: ({ row }) => row.original.paidByName || "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={STATUS_LABELS[row.original.status]} variant={EXPENSE_STATUS_VARIANT[row.original.status]} />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <RowActions
        viewHref={`/expenses/${row.original.id}`}
        editHref={`/expenses/${row.original.id}/edit`}
        entityLabel="Expense"
        onDelete={() => deleteExpense(row.original.id)}
      />
    ),
  },
];
