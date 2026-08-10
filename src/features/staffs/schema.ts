import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  position: z.string().min(1, "Select a position"),
  phone: z.string().min(1, "Phone number is required"),
  department: z.string().min(1, "Select a department"),
  email: z.email("Enter a valid email address"),
  dateOfBirth: z.string().optional(),
  systemRole: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  salary: z.coerce.number().nonnegative(),
  imageUrl: z.string().optional(),
});

export type StaffInput = z.output<typeof staffSchema>;
export type StaffFormInput = z.input<typeof staffSchema>;
