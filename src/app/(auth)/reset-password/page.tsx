import { AuthCard } from "@/components/layout/auth-card";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard>
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
