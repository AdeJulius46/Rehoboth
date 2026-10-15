import { db } from "@/lib/db";

export type StockMovementRow = {
  id: string;
  createdAt: Date;
  reason: string;
  delta: number;
  quantityAfter: number;
  unit: string;
  warehouseName: string | null;
  productName: string | null;
  saleNumber: string | null;
  note: string | null;
  createdByName: string | null;
};

/** All stock movements for one product, across every warehouse it's stocked in. */
export async function getProductStockMovements(productId: string, limit = 50): Promise<StockMovementRow[]> {
  const movements = await db.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      product: { select: { unit: true } },
      warehouse: { select: { name: true } },
      createdBy: { select: { name: true } },
      sale: { select: { number: true } },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    createdAt: m.createdAt,
    reason: m.reason,
    delta: m.delta,
    quantityAfter: m.quantityAfter,
    unit: m.product.unit,
    warehouseName: m.warehouse.name,
    productName: null,
    saleNumber: m.sale?.number ?? null,
    note: m.note,
    createdByName: m.createdBy?.name ?? null,
  }));
}

/** All stock movements recorded in one warehouse, across every product in it. */
export async function getWarehouseStockMovements(warehouseId: string, limit = 50): Promise<StockMovementRow[]> {
  const movements = await db.stockMovement.findMany({
    where: { warehouseId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      product: { select: { name: true, unit: true } },
      createdBy: { select: { name: true } },
      sale: { select: { number: true } },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    createdAt: m.createdAt,
    reason: m.reason,
    delta: m.delta,
    quantityAfter: m.quantityAfter,
    unit: m.product.unit,
    warehouseName: null,
    productName: m.product.name,
    saleNumber: m.sale?.number ?? null,
    note: m.note,
    createdByName: m.createdBy?.name ?? null,
  }));
}
