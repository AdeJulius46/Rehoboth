/**
 * Per-business branding. Each deployment of this app sets its own NEXT_PUBLIC_BRAND_*
 * variables; the fallbacks below are Rehoboth's, so an unconfigured deploy is unchanged.
 * NEXT_PUBLIC_ is required because client components (auth screens) read this too.
 */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "REHOBOTH",
  /** Used in file names, e.g. "rehoboth-report-2026-09-30.csv". */
  slug: (process.env.NEXT_PUBLIC_BRAND_NAME || "REHOBOTH").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  logo: process.env.NEXT_PUBLIC_BRAND_LOGO || "/logo.png",
  phone: process.env.NEXT_PUBLIC_BRAND_PHONE || "+234 703983687",
  email: process.env.NEXT_PUBLIC_BRAND_EMAIL || "rehobothnig@hotmail.com",
  country: process.env.NEXT_PUBLIC_BRAND_COUNTRY || "Nigeria",
  supportPhone: process.env.NEXT_PUBLIC_BRAND_SUPPORT_PHONE || "+234 800 123 4567",
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL || "support@rehobothsoftware.com",
};
