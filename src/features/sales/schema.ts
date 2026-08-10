import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
});

export const saleSchema = z.object({
  number: z.string().optional(),
  customerId: z.string().min(1, "Select a customer"),
  agentId: z.string().optional(),
  warehouseId: z.string().min(1, "Select a warehouse"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "POS"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Add at least one product"),
});

export const saleUpdateSchema = z.object({
  agentId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "POS"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
});

export type SaleItemInput = z.output<typeof saleItemSchema>;
export type SaleInput = z.output<typeof saleSchema>;
export type SaleFormInput = z.input<typeof saleSchema>;
export type SaleUpdateInput = z.output<typeof saleUpdateSchema>;
export type SaleUpdateFormInput = z.input<typeof saleUpdateSchema>;
