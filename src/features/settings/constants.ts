// The seeded, permanent System Admin account — its role can never be changed
// via the UI, regardless of how many other admins exist.
export const SYSTEM_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@rehobothsoftware.com";
