"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { warehouseSchema } from "@/features/warehouses/schema";
import { generateWarehouseCode } from "@/features/warehouses/queries";

export type ActionResult = { success: true } | { success: false; error: string };

function parseWarehouseForm(formData: FormData) {
  return warehouseSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    location: formData.get("location"),
    manager: formData.get("manager") || undefined,
    status: formData.get("status") || "ACTIVE",
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    notes: formData.get("notes") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createWarehouse(formData: FormData): Promise<ActionResult> {
  const code = (formData.get("code") as string) || (await generateWarehouseCode());
  formData.set("code", code);
  const parsed = parseWarehouseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const warehouse = await db.warehouse.create({ data: { ...parsed.data, code } });
  revalidatePath("/warehouses");
  redirect(`/warehouses/${warehouse.id}`);
}

export async function updateWarehouse(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseWarehouseForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await db.warehouse.update({ where: { id }, data: parsed.data });
  revalidatePath("/warehouses");
  revalidatePath(`/warehouses/${id}`);
  redirect(`/warehouses/${id}`);
}

export async function deleteWarehouse(id: string): Promise<ActionResult> {
  await db.warehouse.delete({ where: { id } });
  revalidatePath("/warehouses");
  return { success: true };
}

export async function archiveWarehouse(id: string): Promise<ActionResult> {
  const warehouse = await db.warehouse.findUnique({ where: { id } });
  if (!warehouse) {
    return { success: false, error: "Warehouse not found" };
  }

  await db.warehouse.update({
    where: { id },
    data: { status: warehouse.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/warehouses");
  revalidatePath(`/warehouses/${id}`);
  return { success: true };
}

export async function setStockQuantity(stockId: string, quantity: number): Promise<ActionResult> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { success: false, error: "Enter a valid quantity" };
  }

  const stock = await db.stock.findUnique({ where: { id: stockId } });
  if (!stock) {
    return { success: false, error: "Stock record not found" };
  }

  await db.stock.update({ where: { id: stockId }, data: { quantity } });
  revalidatePath(`/warehouses/${stock.warehouseId}`);
  revalidatePath(`/products/${stock.productId}`);
  return { success: true };
}

export async function addProductStock(
  warehouseId: string,
  productId: string,
  quantity: number,
): Promise<ActionResult> {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: "Enter a valid quantity" };
  }

  await db.stock.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    create: { productId, warehouseId, quantity },
    update: { quantity: { increment: quantity } },
  });

  revalidatePath(`/warehouses/${warehouseId}`);
  revalidatePath(`/products/${productId}`);
  return { success: true };
}
