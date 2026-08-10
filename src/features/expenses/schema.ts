import { z } from "zod";

export const expenseSchema = z.object({
  number: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  description: z.string().min(1, "Enter a description"),
  amount: z.coerce.number().positive("Enter an amount"),
  date: z.string().min(1, "Date is required"),
  paidById: z.string().optional(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "POS"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export type ExpenseInput = z.output<typeof expenseSchema>;
export type ExpenseFormInput = z.input<typeof expenseSchema>;
