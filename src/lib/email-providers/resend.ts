import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

const resendClient = apiKey ? new Resend(apiKey) : null;

export function isResendConfigured() {
  return !!(resendClient && fromEmail);
}

export async function sendEmailViaResend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resendClient || !fromEmail) {
    throw new Error("Resend is not configured — missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
  }

  const { error } = await resendClient.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
