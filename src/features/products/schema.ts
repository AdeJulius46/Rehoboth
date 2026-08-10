import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  brand: z.string().optional(),
  unit: z.string().min(1, "Select a unit"),
  description: z.string().optional(),
  costPrice: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  openingStock: z.coerce.number().int().nonnegative().default(0),
  reorderLevel: z.coerce.number().int().nonnegative().default(0),
  imageUrl: z.string().optional(),
});

export type ProductInput = z.output<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
