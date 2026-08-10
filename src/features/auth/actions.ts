"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { db } from "@/lib/db";
import { getAppUrl, isEmailConfigured, sendEmail } from "@/lib/email";
import { passwordResetEmailTemplate } from "@/lib/email-templates";
import { contactAdminSchema, forgotPasswordSchema, resetPasswordSchema } from "@/features/auth/schema";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult<{ devResetToken?: string }>> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Always report success regardless of whether the account exists, so this
  // endpoint can't be used to discover which emails are registered.
  if (!user) {
    return { success: true, data: {} };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  if (!isEmailConfigured()) {
    // No email delivery provider is wired up yet, so the raw token is returned
    // directly for the UI to surface as a dev-mode link.
    return { success: true, data: { devResetToken: token } };
  }

  const resetLink = `${getAppUrl()}/reset-password?token=${token}`;
  const { subject, html, text } = passwordResetEmailTemplate({ resetLink, expiresInMinutes: 30 });
  try {
    await sendEmail({ to: parsed.data.email, subject, html, text });
  } catch (err) {
    // Swallow the failure rather than surfacing it — this endpoint always
    // reports success so it can't be used to discover which emails are
    // registered, and that invariant must hold even when delivery fails.
    console.error("Failed to send password reset email:", err);
  }

  return { success: true, data: {} };
}

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function submitContactAdminRequest(formData: FormData): Promise<ActionResult> {
  const parsed = contactAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // No SupportRequest model exists yet — this is a stub until that's scoped.
  return { success: true, data: undefined };
}
