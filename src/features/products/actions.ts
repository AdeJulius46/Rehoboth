"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { productSchema } from "@/features/products/schema";
import { generateSku, getDefaultWarehouse } from "@/features/products/queries";

export type ActionResult = { success: true } | { success: false; error: string };

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    category: formData.get("category"),
    brand: formData.get("brand") || undefined,
    unit: formData.get("unit"),
    description: formData.get("description") || undefined,
    costPrice: formData.get("costPrice") || 0,
    sellingPrice: formData.get("sellingPrice") || 0,
    openingStock: formData.get("openingStock") || 0,
    reorderLevel: formData.get("reorderLevel") || 0,
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const sku = (formData.get("sku") as string) || (await generateSku());
  formData.set("sku", sku);
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) {
    return { success: false, error: "A product with this code already exists." };
  }

  const { openingStock, ...productData } = parsed.data;
  const defaultWarehouse = await getDefaultWarehouse();

  const product = await db.product.create({
    data: {
      ...productData,
      sku,
      ...(defaultWarehouse && openingStock > 0
        ? { stock: { create: { warehouseId: defaultWarehouse.id, quantity: openingStock } } }
        : {}),
    },
  });
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing && existing.id !== id) {
    return { success: false, error: "A product with this code already exists." };
  }

  const { openingStock: _openingStock, ...productData } = parsed.data;
  void _openingStock;
  await db.product.update({ where: { id }, data: productData });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await db.product.delete({ where: { id } });
  revalidatePath("/products");
  return { success: true };
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return { success: false, error: "Product not found" };
  }

  await db.product.update({
    where: { id },
    data: { status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { success: true };
}
