import { z } from "zod";
import { ROLES } from "@/lib/constants";

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token"),
    password: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const contactAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  subject: z.string().min(1, "Select a subject"),
  message: z.string().min(1, "Message is required"),
});

export type ContactAdminInput = z.infer<typeof contactAdminSchema>;

export const createAccountSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    agreeToTerms: z.literal(true, "You must agree to the Terms of Service and Privacy Policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const sendCodeSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const verifyCodeSchema = z.object({
  email: z.email("Enter a valid email address"),
  code: z.string().min(1, "Enter the security code"),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Select a department"),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  country: z.string().min(1, "Select a country"),
  businessAddress: z.string().min(1, "Business address is required"),
});

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;

export const preferencesSchema = z.object({
  requestedRole: z.enum(ROLES),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const completeRegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  personal: personalInfoSchema,
  company: companyInfoSchema.optional(),
  preferences: preferencesSchema,
});

export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;
