import type { db } from "@/lib/db";
import type { StockMovementReason } from "@/generated/prisma/enums";

/**
 * Inferred from `db.$transaction`'s callback rather than importing a generated
 * transaction-client type name directly, so this keeps working across Prisma
 * client regenerations.
 */
type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export type AdjustStockParams = {
  productId: string;
  warehouseId: string;
  /** Positive to add stock, negative to remove it. Never zero. */
  delta: number;
  reason: StockMovementReason;
  /** Who performed the action, when known — null for system/unattended changes. */
  createdById?: string | null;
  /** The sale this movement was caused by, for SALE* reasons. */
  saleId?: string | null;
  note?: string | null;
};

/**
 * The single place every Stock quantity change goes through. Updates the
 * running total in `Stock` and writes the matching `StockMovement` audit row
 * in the same call, so the two can never drift apart.
 *
 * Must be called inside a `db.$transaction`, passing that transaction's `tx` —
 * callers already wrap sale creation/cancellation in one, since the sale and
 * its stock changes must commit or roll back together.
 */
export async function adjustStock(tx: Tx, params: AdjustStockParams) {
  if (params.delta === 0) {
    throw new Error("adjustStock: delta must not be zero");
  }

  const stock = await tx.stock.upsert({
    where: { productId_warehouseId: { productId: params.productId, warehouseId: params.warehouseId } },
    create: {
      productId: params.productId,
      warehouseId: params.warehouseId,
      quantity: Math.max(0, params.delta),
    },
    update: { quantity: { increment: params.delta } },
  });

  await tx.stockMovement.create({
    data: {
      productId: params.productId,
      warehouseId: params.warehouseId,
      delta: params.delta,
      quantityAfter: stock.quantity,
      reason: params.reason,
      note: params.note,
      saleId: params.saleId,
      createdById: params.createdById,
    },
  });

  return stock;
}
