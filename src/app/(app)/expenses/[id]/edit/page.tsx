import { notFound } from "next/navigation";

import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { updateExpense } from "@/features/expenses/actions";
import { getExpenseById, getPaidByOptions } from "@/features/expenses/queries";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [expense, paidByOptions] = await Promise.all([getExpenseById(id), getPaidByOptions()]);

  if (!expense) {
    notFound();
  }

  return (
    <ExpenseForm
      mode="edit"
      paidByOptions={paidByOptions}
      defaultValues={{
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().slice(0, 10),
        paidById: expense.paidById ?? "",
        paymentMethod: expense.paymentMethod ?? undefined,
        status: expense.status,
      }}
      onSubmit={updateExpense.bind(null, id)}
    />
  );
}
