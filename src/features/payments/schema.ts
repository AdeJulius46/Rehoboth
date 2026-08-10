import { z } from "zod";

export const paymentSchema = z.object({
  reference: z.string().optional(),
  customerId: z.string().min(1, "Select a customer"),
  invoiceId: z.string().optional(),
  amount: z.coerce.number().positive("Enter a payment amount"),
  method: z.enum(["CASH", "TRANSFER", "CARD", "POS"]),
  date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

export const paymentUpdateSchema = z.object({
  amount: z.coerce.number().positive("Enter a payment amount"),
  method: z.enum(["CASH", "TRANSFER", "CARD", "POS"]),
  date: z.string().min(1, "Payment date is required"),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
  notes: z.string().optional(),
});

export type PaymentInput = z.output<typeof paymentSchema>;
export type PaymentFormInput = z.input<typeof paymentSchema>;
export type PaymentUpdateInput = z.output<typeof paymentUpdateSchema>;
export type PaymentUpdateFormInput = z.input<typeof paymentUpdateSchema>;
