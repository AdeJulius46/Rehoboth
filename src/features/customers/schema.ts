import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  companyName: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.email("Enter a valid email address"),
  type: z.enum(["INDIVIDUAL", "BUSINESS"]),
  taxId: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  openingBalance: z.coerce.number().nonnegative().default(0),
  imageUrl: z.string().optional(),
});

export type CustomerInput = z.output<typeof customerSchema>;
export type CustomerFormInput = z.input<typeof customerSchema>;
