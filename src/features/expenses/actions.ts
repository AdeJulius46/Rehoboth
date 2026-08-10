"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { expenseSchema } from "@/features/expenses/schema";
import { generateExpenseNumber } from "@/features/expenses/queries";

export type ActionResult = { success: true } | { success: false; error: string };

function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    number: formData.get("number") || undefined,
    category: formData.get("category"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    paidById: formData.get("paidById") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    status: formData.get("status") || "PENDING",
  });
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const number = (formData.get("number") as string) || (await generateExpenseNumber());
  formData.set("number", number);
  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { paidById, date, ...rest } = parsed.data;

  const expense = await db.expense.create({
    data: { ...rest, number, paidById: paidById || null, date: new Date(date) },
  });

  revalidatePath("/expenses");
  redirect(`/expenses/${expense.id}`);
}

export async function updateExpense(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { paidById, date, number: _number, ...rest } = parsed.data;
  void _number;

  await db.expense.update({
    where: { id },
    data: { ...rest, paidById: paidById || null, date: new Date(date) },
  });

  revalidatePath("/expenses");
  revalidatePath(`/expenses/${id}`);
  redirect(`/expenses/${id}`);
}

export async function updateExpenseStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
): Promise<ActionResult> {
  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) {
    return { success: false, error: "Expense not found" };
  }

  await db.expense.update({ where: { id }, data: { status } });

  revalidatePath("/expenses");
  revalidatePath(`/expenses/${id}`);
  return { success: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  await db.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  return { success: true };
}
