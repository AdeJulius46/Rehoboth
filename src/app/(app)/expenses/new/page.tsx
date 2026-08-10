import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { createExpense } from "@/features/expenses/actions";
import { getPaidByOptions } from "@/features/expenses/queries";

export default async function AddExpensePage() {
  const paidByOptions = await getPaidByOptions();

  return <ExpenseForm mode="create" paidByOptions={paidByOptions} onSubmit={createExpense} />;
}
