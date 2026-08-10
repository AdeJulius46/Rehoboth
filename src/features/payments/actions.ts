"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { paymentSchema, paymentUpdateSchema } from "@/features/payments/schema";
import { generatePaymentReference } from "@/features/payments/queries";

export type ActionResult = { success: true } | { success: false; error: string };

async function syncInvoiceStatus(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: "COMPLETED" }, select: { amount: true } } },
  });
  if (!invoice) return;

  const paid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  if (paid >= Number(invoice.total) && invoice.status !== "PAID") {
    await db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });
  }
}

export async function createPayment(formData: FormData): Promise<ActionResult> {
  const reference = (formData.get("reference") as string) || (await generatePaymentReference());

  const parsed = paymentSchema.safeParse({
    reference,
    customerId: formData.get("customerId"),
    invoiceId: formData.get("invoiceId") || undefined,
    amount: formData.get("amount"),
    method: formData.get("method"),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { customerId, invoiceId, amount, method, date, notes } = parsed.data;

  const payment = await db.payment.create({
    data: {
      reference,
      customerId,
      invoiceId: invoiceId || null,
      amount,
      method,
      date: new Date(date),
      status: "COMPLETED",
      notes,
    },
  });

  if (invoiceId) {
    await syncInvoiceStatus(invoiceId);
  }

  revalidatePath("/payments");
  if (invoiceId) revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/payments/${payment.id}`);
}

export async function updatePayment(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = paymentUpdateSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    date: formData.get("date"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { amount, method, date, status, notes } = parsed.data;

  const existing = await db.payment.update({
    where: { id },
    data: { amount, method, date: new Date(date), status, notes },
  });

  if (existing.invoiceId) {
    await syncInvoiceStatus(existing.invoiceId);
  }

  revalidatePath("/payments");
  revalidatePath(`/payments/${id}`);
  redirect(`/payments/${id}`);
}

export async function deletePayment(id: string): Promise<ActionResult> {
  await db.payment.delete({ where: { id } });
  revalidatePath("/payments");
  return { success: true };
}
