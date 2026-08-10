import { z } from "zod";

export const agentSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  region: z.string().min(1, "Select a territory"),
  phone: z.string().min(1, "Phone number is required"),
  agentType: z.enum(["SALES", "COLLECTION"]),
  email: z.email("Enter a valid email address"),
  idNumber: z.string().optional(),
  commissionRate: z.coerce.number().min(0).max(100),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type AgentInput = z.output<typeof agentSchema>;
export type AgentFormInput = z.input<typeof agentSchema>;
