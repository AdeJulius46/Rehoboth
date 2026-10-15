"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saleSchema, saleUpdateSchema } from "@/features/sales/schema";
import { generateSaleNumber } from "@/features/sales/queries";
import { adjustStock } from "@/features/stock-movements/adjust-stock";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createSale(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  const number = (formData.get("number") as string) || (await generateSaleNumber());

  let items: unknown;
  try {
    items = JSON.parse((formData.get("items") as string) || "[]");
  } catch {
    return { success: false, error: "Invalid line items" };
  }

  const parsed = saleSchema.safeParse({
    number,
    customerId: formData.get("customerId"),
    agentId: formData.get("agentId") || undefined,
    warehouseId: formData.get("warehouseId"),
    date: formData.get("date"),
    paymentMethod: formData.get("paymentMethod") || undefined,
    status: formData.get("status") || "PENDING",
    notes: formData.get("notes") || undefined,
    items,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { agentId, warehouseId, customerId, date, paymentMethod, status, notes, items: parsedItems } = parsed.data;

  const stockRows = await db.stock.findMany({
    where: { warehouseId, productId: { in: parsedItems.map((item) => item.productId) } },
  });
  const stockMap = new Map(stockRows.map((s) => [s.productId, s.quantity]));

  for (const item of parsedItems) {
    const available = stockMap.get(item.productId) ?? 0;
    if (item.quantity > available) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      return {
        success: false,
        error: `Insufficient stock for ${product?.name ?? "product"} (${available} available)`,
      };
    }
  }

  const lineItems = parsedItems.map((item) => ({
    ...item,
    lineTotal: item.quantity * item.unitPrice - item.discount,
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = 0;
  const total = subtotal + tax;

  const sale = await db.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        number,
        customerId,
        agentId: agentId || null,
        warehouseId,
        date: new Date(date),
        paymentMethod: paymentMethod || null,
        status,
        notes,
        subtotal,
        tax,
        total,
        createdById: session?.user?.id ?? null,
        items: { create: lineItems },
      },
    });

    for (const item of lineItems) {
      await adjustStock(tx, {
        productId: item.productId,
        warehouseId,
        delta: -item.quantity,
        reason: "SALE",
        saleId: created.id,
        createdById: session?.user?.id,
      });
    }

    return created;
  });

  revalidatePath("/sales");
  redirect(`/sales/${sale.id}`);
}

export async function updateSale(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = saleUpdateSchema.safeParse({
    agentId: formData.get("agentId") || undefined,
    date: formData.get("date"),
    paymentMethod: formData.get("paymentMethod") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { agentId, date, paymentMethod, status, notes } = parsed.data;

  await db.sale.update({
    where: { id },
    data: { agentId: agentId || null, date: new Date(date), paymentMethod: paymentMethod || null, status, notes },
  });

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  redirect(`/sales/${id}`);
}

export async function updateSaleStatus(
  id: string,
  status: "PENDING" | "COMPLETED" | "CANCELLED",
): Promise<ActionResult> {
  const session = await auth();
  const sale = await db.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) {
    return { success: false, error: "Sale not found" };
  }
  if (sale.status === status) {
    return { success: true };
  }

  await db.$transaction(async (tx) => {
    if (sale.warehouseId) {
      if (status === "CANCELLED" && sale.status !== "CANCELLED") {
        for (const item of sale.items) {
          await adjustStock(tx, {
            productId: item.productId,
            warehouseId: sale.warehouseId!,
            delta: item.quantity,
            reason: "SALE_CANCELLED",
            saleId: sale.id,
            createdById: session?.user?.id,
          });
        }
      } else if (sale.status === "CANCELLED" && status !== "CANCELLED") {
        for (const item of sale.items) {
          await adjustStock(tx, {
            productId: item.productId,
            warehouseId: sale.warehouseId!,
            delta: -item.quantity,
            reason: "SALE_REINSTATED",
            saleId: sale.id,
            createdById: session?.user?.id,
          });
        }
      }
    }
    await tx.sale.update({ where: { id }, data: { status } });
  });

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
  return { success: true };
}

export async function deleteSale(id: string): Promise<ActionResult> {
  const session = await auth();
  const sale = await db.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) {
    return { success: false, error: "Sale not found" };
  }

  await db.$transaction(async (tx) => {
    if (sale.status !== "CANCELLED" && sale.warehouseId) {
      for (const item of sale.items) {
        await adjustStock(tx, {
          productId: item.productId,
          warehouseId: sale.warehouseId!,
          delta: item.quantity,
          reason: "SALE_DELETED",
          saleId: sale.id,
          createdById: session?.user?.id,
        });
      }
    }
    await tx.sale.delete({ where: { id } });
  });

  revalidatePath("/sales");
  return { success: true };
}
