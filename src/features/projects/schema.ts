import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  code: z.string().optional(),
  customerId: z.string().optional(),
  agentId: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  budget: z.coerce.number().nonnegative(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  progress: z.coerce.number().int().min(0).max(100).default(0),
});

export type ProjectInput = z.output<typeof projectSchema>;
export type ProjectFormInput = z.input<typeof projectSchema>;
