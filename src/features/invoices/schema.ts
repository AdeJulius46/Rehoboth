import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().default(0),
});

export const invoiceSchema = z.object({
  number: z.string().optional(),
  customerId: z.string().min(1, "Select a customer"),
  agentId: z.string().optional(),
  issueDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentTerm: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one product"),
});

export const invoiceUpdateSchema = z.object({
  agentId: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  paymentTerm: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
  notes: z.string().optional(),
});

export type InvoiceItemInput = z.output<typeof invoiceItemSchema>;
export type InvoiceInput = z.output<typeof invoiceSchema>;
export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceUpdateInput = z.output<typeof invoiceUpdateSchema>;
export type InvoiceUpdateFormInput = z.input<typeof invoiceUpdateSchema>;
