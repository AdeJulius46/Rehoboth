import { toCsv } from "@/lib/csv";
import type { ExpenseExportRow } from "@/features/expenses/queries";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Paid",
  REJECTED: "Rejected",
};

function formatDate(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

/** Amounts are bare numbers, not formatted naira, so the file stays usable in spreadsheet formulas. */
export function buildExpenseCsv(rows: ExpenseExportRow[]): string {
  const header = [
    "Expense ID",
    "Date",
    "Category",
    "Description",
    "Vendor",
    "Amount (NGN)",
    "Payment Method",
    "Status",
    "Paid By",
  ];

  const body = rows.map((row) => [
    row.number,
    formatDate(row.date),
    row.category,
    row.description,
    row.vendor,
    row.amount,
    row.paymentMethod,
    STATUS_LABELS[row.status] ?? row.status,
    row.paidByName,
  ]);

  return toCsv([header, ...body]);
}
