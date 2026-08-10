"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { customerSchema } from "@/features/customers/schema";

export type ActionResult = { success: true } | { success: false; error: string };
export type QuickCreateResult =
  | { success: true; data: { id: string; name: string } }
  | { success: false; error: string };

function parseCustomerForm(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email"),
    type: formData.get("type"),
    taxId: formData.get("taxId") || undefined,
    address: formData.get("address") || undefined,
    creditLimit: formData.get("creditLimit") || undefined,
    openingBalance: formData.get("openingBalance") || 0,
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "A customer with this email already exists." };
  }

  const customer = await db.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

/**
 * Same validation/creation as createCustomer, but returns the created row
 * instead of redirecting — for quick-add flows (e.g. from Sales/Invoice
 * forms) that need to stay on the current page.
 */
export async function createCustomerQuick(formData: FormData): Promise<QuickCreateResult> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "A customer with this email already exists." };
  }

  const customer = await db.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  return { success: true, data: { id: customer.id, name: customer.name } };
}

export async function updateCustomer(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== id) {
    return { success: false, error: "A customer with this email already exists." };
  }

  await db.customer.update({ where: { id }, data: parsed.data });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  await db.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return { success: true };
}

export async function archiveCustomer(id: string): Promise<ActionResult> {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) {
    return { success: false, error: "Customer not found" };
  }

  await db.customer.update({
    where: { id },
    data: { status: customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { success: true };
}
