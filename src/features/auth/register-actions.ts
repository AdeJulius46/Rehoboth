"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { db } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { otpEmailTemplate } from "@/lib/email-templates";
import {
  completeRegistrationSchema,
  sendCodeSchema,
  verifyCodeSchema,
  type CompleteRegistrationInput,
} from "@/features/auth/schema";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const CODE_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationCode(email: string): Promise<ActionResult<{ devCode?: string }>> {
  const parsed = sendCodeSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const code = crypto.randomInt(10_000_000, 99_999_999).toString();
  await db.emailVerificationCode.create({
    data: {
      email: parsed.data.email,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  if (!isEmailConfigured()) {
    // No email delivery provider is wired up yet, so the code is returned
    // directly for the UI to surface in dev.
    return { success: true, data: { devCode: code } };
  }

  const { subject, html, text } = otpEmailTemplate({ code, expiresInMinutes: 10 });
  try {
    await sendEmail({ to: parsed.data.email, subject, html, text });
  } catch (err) {
    console.error("Failed to send verification code email:", err);
    return { success: false, error: "We couldn't send the verification email. Please check the address and try again." };
  }

  return { success: true, data: {} };
}

export async function verifyRegistrationCode(email: string, code: string): Promise<ActionResult> {
  const parsed = verifyCodeSchema.safeParse({ email, code });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const pending = await db.emailVerificationCode.findFirst({
    where: { email: parsed.data.email, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!pending || pending.expiresAt < new Date()) {
    return { success: false, error: "This code has expired. Request a new one." };
  }
  if (pending.codeHash !== hashCode(parsed.data.code)) {
    return { success: false, error: "Incorrect security code." };
  }

  await db.emailVerificationCode.update({ where: { id: pending.id }, data: { usedAt: new Date() } });
  return { success: true, data: undefined };
}

export async function checkCompanyExists(): Promise<boolean> {
  const count = await db.company.count();
  return count > 0;
}

export async function checkEmailAvailable(email: string): Promise<ActionResult> {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }
  return { success: true, data: undefined };
}

export async function completeRegistration(
  input: CompleteRegistrationInput,
): Promise<ActionResult> {
  const parsed = completeRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const companyExists = await checkCompanyExists();
  if (!companyExists && parsed.data.company) {
    await db.company.create({
      data: {
        name: parsed.data.company.companyName,
        industry: parsed.data.company.industry,
        size: parsed.data.company.companySize,
        country: parsed.data.company.country,
        address: parsed.data.company.businessAddress,
      },
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      name: parsed.data.personal.fullName,
      email: parsed.data.email,
      passwordHash,
      phone: parsed.data.personal.phone,
      jobTitle: parsed.data.personal.jobTitle,
      department: parsed.data.personal.department,
      role: "STAFF",
      requestedRole: parsed.data.preferences.requestedRole,
      status: "PENDING",
    },
  });

  return { success: true, data: undefined };
}
