import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "sku", "createdAt", "costPrice", "sellingPrice"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListProductsParams = {
  q?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

function stockStatus(quantity: number, reorderLevel: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= reorderLevel) return "low_stock";
  return "in_stock";
}

export async function listProducts(params: ListProductsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { sku: { contains: params.q, mode: "insensitive" as const } },
            { category: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "ACTIVE" | "INACTIVE" } : {}),
    ...(params.category && params.category !== "all" ? { category: params.category } : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [products, totalItems] = await Promise.all([
    db.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { stock: true } }),
    db.product.count({ where }),
  ]);

  const rows = products.map((product) => {
    const { stock, ...rest } = product;
    const quantity = stock.reduce((sum, s) => sum + s.quantity, 0);
    return {
      ...rest,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      quantity,
      stockStatus: stockStatus(quantity, product.reorderLevel),
    };
  });

  return { rows, totalItems, page, pageSize };
}

export type ProductListRow = Awaited<ReturnType<typeof listProducts>>["rows"][number];

export async function getProductStats() {
  const [total, active, products] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.findMany({ include: { stock: true } }),
  ]);

  let lowStock = 0;
  let outOfStock = 0;
  let totalValue = 0;

  for (const product of products) {
    const quantity = product.stock.reduce((sum, s) => sum + s.quantity, 0);
    totalValue += quantity * Number(product.costPrice);
    if (quantity <= 0) outOfStock += 1;
    else if (quantity <= product.reorderLevel) lowStock += 1;
  }

  return { total, active, lowStock, outOfStock, totalValue };
}

export async function getProductById(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    include: { stock: { include: { warehouse: true } } },
  });
  if (!product) return null;

  const quantity = product.stock.reduce((sum, s) => sum + s.quantity, 0);
  return {
    ...product,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    quantity,
  };
}

export async function generateSku() {
  const prefix = "PRD-";
  const last = await db.product.findFirst({ orderBy: { sku: "desc" }, select: { sku: true } });
  const lastSeq = last ? parseInt(last.sku.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}

export async function getDefaultWarehouse() {
  return db.warehouse.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
}
