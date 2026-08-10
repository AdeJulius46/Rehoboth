import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  manager: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  phone: z.string().optional(),
  email: z.email("Enter a valid email address").optional().or(z.literal("")),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type WarehouseInput = z.output<typeof warehouseSchema>;
export type WarehouseFormInput = z.input<typeof warehouseSchema>;
