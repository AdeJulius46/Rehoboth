import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "code", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListWarehousesParams = {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listWarehouses(params: ListWarehousesParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { code: { contains: params.q, mode: "insensitive" as const } },
            { manager: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "ACTIVE" | "INACTIVE" } : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [warehouses, totalItems] = await Promise.all([
    db.warehouse.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { stock: { include: { product: true } } },
    }),
    db.warehouse.count({ where }),
  ]);

  const rows = warehouses.map((warehouse) => {
    const { stock, ...rest } = warehouse;
    return {
      ...rest,
      itemsInStock: stock.reduce((sum, s) => sum + s.quantity, 0),
      stockValue: stock.reduce((sum, s) => sum + s.quantity * Number(s.product.costPrice), 0),
    };
  });

  return { rows, totalItems, page, pageSize };
}

export type WarehouseListRow = Awaited<ReturnType<typeof listWarehouses>>["rows"][number];

export async function getWarehouseStats() {
  const [total, warehouses] = await Promise.all([
    db.warehouse.count(),
    db.warehouse.findMany({ include: { stock: { include: { product: true } } } }),
  ]);

  const totalStockItems = warehouses.reduce(
    (sum, w) => sum + w.stock.reduce((s, item) => s + item.quantity, 0),
    0,
  );
  const totalStockValue = warehouses.reduce(
    (sum, w) => sum + w.stock.reduce((s, item) => s + item.quantity * Number(item.product.costPrice), 0),
    0,
  );
  const lowStockItems = warehouses.reduce(
    (sum, w) => sum + w.stock.filter((item) => item.quantity > 0 && item.quantity <= item.product.reorderLevel).length,
    0,
  );

  return { total, totalStockItems, totalStockValue, lowStockItems };
}

export async function getWarehouseById(id: string) {
  return db.warehouse.findUnique({
    where: { id },
    include: { stock: { include: { product: true } } },
  });
}

export async function getAvailableProductsForWarehouse(warehouseId: string) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE", stock: { none: { warehouseId } } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true },
  });

  return products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }));
}

export async function generateWarehouseCode() {
  const prefix = "WH-";
  const last = await db.warehouse.findFirst({ orderBy: { code: "desc" }, select: { code: true } });
  const lastSeq = last ? parseInt(last.code.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}
