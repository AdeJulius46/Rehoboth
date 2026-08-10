import { isResendConfigured, sendEmailViaResend } from "./email-providers/resend";
import { isSesConfigured, sendEmailViaSes } from "./email-providers/ses";

// EMAIL_PROVIDER picks which provider is active — set to "ses" to switch back
// to AWS SES without deleting its implementation. Defaults to Resend since
// SES's sandbox mode blocks sending to unverified recipients.
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER === "ses" ? "ses" : "resend";

export function isEmailConfigured() {
  return EMAIL_PROVIDER === "ses" ? isSesConfigured() : isResendConfigured();
}

export async function sendEmail(params: { to: string; subject: string; html: string; text?: string }) {
  if (EMAIL_PROVIDER === "ses") {
    return sendEmailViaSes(params);
  }
  return sendEmailViaResend(params);
}

// Vercel injects the project's stable production domain into every
// deployment (including previews) as VERCEL_PROJECT_PRODUCTION_URL, so links
// in emails point at production without needing APP_URL set manually per
// deploy. APP_URL still wins when set, e.g. for local dev or a custom domain.
export function getAppUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
