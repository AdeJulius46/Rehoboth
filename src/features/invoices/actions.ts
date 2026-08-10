"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { invoiceSchema, invoiceUpdateSchema } from "@/features/invoices/schema";
import { generateInvoiceNumber } from "@/features/invoices/queries";
import { generatePaymentReference } from "@/features/payments/queries";

export type ActionResult = { success: true } | { success: false; error: string };

async function syncSaleStatusFromInvoice(saleId: string | null) {
  if (!saleId) return;

  const sale = await db.sale.findUnique({ where: { id: saleId }, select: { status: true } });
  if (!sale || sale.status === "COMPLETED") return;

  await db.sale.update({ where: { id: saleId }, data: { status: "COMPLETED" } });
  revalidatePath("/sales");
  revalidatePath(`/sales/${saleId}`);
}

export async function createInvoice(formData: FormData): Promise<ActionResult> {
  const number = (formData.get("number") as string) || (await generateInvoiceNumber());

  let items: unknown;
  try {
    items = JSON.parse((formData.get("items") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid line items" };
  }

  const parsed = invoiceSchema.safeParse({
    number,
    customerId: formData.get("customerId"),
    agentId: formData.get("agentId") || undefined,
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    paymentTerm: formData.get("paymentTerm") || undefined,
    status: "DRAFT",
    notes: formData.get("notes") || undefined,
    items,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    agentId,
    customerId,
    issueDate,
    dueDate,
    paymentTerm,
    status,
    notes,
    items: parsedItems,
  } = parsed.data;

  const lineItems = parsedItems.map((item) => ({
    ...item,
    lineTotal: item.quantity * item.unitPrice - item.discount,
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const tax = 0;
  const total = subtotal - discount + tax;

  const invoice = await db.invoice.create({
    data: {
      number,
      customerId,
      agentId: agentId || null,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      paymentTerm,
      status,
      notes,
      subtotal,
      discount,
      tax,
      total,
      items: { create: lineItems },
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function generateInvoiceFromSale(saleId: string): Promise<ActionResult> {
  const sale = await db.sale.findUnique({
    where: { id: saleId },
    include: { items: { include: { product: true } }, invoice: true },
  });
  if (!sale) {
    return { success: false, error: "Sale not found" };
  }
  if (sale.invoice) {
    redirect(`/invoices/${sale.invoice.id}`);
  }

  const number = await generateInvoiceNumber();
  const issueDate = sale.date;
  const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const lineItems = sale.items.map((item) => ({
    productId: item.productId,
    description: item.product.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discount: Number(item.discount),
    lineTotal: Number(item.lineTotal),
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const tax = Number(sale.tax);
  const total = subtotal - discount + tax;

  const invoice = await db.invoice.create({
    data: {
      number,
      customerId: sale.customerId,
      agentId: sale.agentId,
      saleId: sale.id,
      issueDate,
      dueDate,
      paymentTerm: "Net 30",
      status: "DRAFT",
      notes: sale.notes,
      subtotal,
      discount,
      tax,
      total,
      items: { create: lineItems },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/sales/${saleId}`);
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = invoiceUpdateSchema.safeParse({
    agentId: formData.get("agentId") || undefined,
    dueDate: formData.get("dueDate"),
    paymentTerm: formData.get("paymentTerm") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { agentId, dueDate, paymentTerm, status, notes } = parsed.data;

  const updated = await db.invoice.update({
    where: { id },
    data: { agentId: agentId || null, dueDate: new Date(dueDate), paymentTerm, status, notes },
  });

  if (status === "PAID") {
    await syncSaleStatusFromInvoice(updated.saleId);
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatus(
  id: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE",
): Promise<ActionResult> {
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  await db.invoice.update({ where: { id }, data: { status } });

  if (status === "PAID") {
    await syncSaleStatusFromInvoice(invoice.saleId);
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true };
}

export async function markInvoiceAsPaid(
  id: string,
  method: "CASH" | "TRANSFER" | "CARD" | "POS",
  date: string,
): Promise<ActionResult> {
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { payments: { where: { status: "COMPLETED" }, select: { amount: true } } },
  });
  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  const alreadyPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.total) - alreadyPaid;

  if (remaining > 0) {
    const reference = await generatePaymentReference();
    await db.payment.create({
      data: {
        reference,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: remaining,
        method,
        date: new Date(date),
        status: "COMPLETED",
      },
    });
  }

  await db.invoice.update({ where: { id }, data: { status: "PAID" } });
  await syncSaleStatusFromInvoice(invoice.saleId);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/payments");
  return { success: true };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  await db.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  return { success: true };
}
