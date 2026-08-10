import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EXPENSE_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getExpenseById } from "@/features/expenses/queries";
import { ExpenseDetailActions } from "@/features/expenses/components/expense-detail-actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Paid",
  REJECTED: "Rejected",
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

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = await getExpenseById(id);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{expense.number}</h1>
              <StatusBadge label={STATUS_LABELS[expense.status]} variant={EXPENSE_STATUS_VARIANT[expense.status]} />
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
          </div>
          <ExpenseDetailActions id={expense.id} status={expense.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-medium text-foreground">{expense.category}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Paid By</p>
            <p className="font-medium text-foreground">{expense.paidBy?.name ?? "—"}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="font-medium text-foreground">
              {expense.paymentMethod ? METHOD_LABELS[expense.paymentMethod] : "—"}
            </p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-foreground">{expense.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="font-medium text-foreground">Amount</span>
          <span className="text-lg font-semibold text-foreground">{formatNaira(expense.amount)}</span>
        </div>
      </Card>
    </div>
  );
}
