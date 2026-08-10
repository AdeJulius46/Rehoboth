import { AuthCard } from "@/components/layout/auth-card";
import { RegisterWizard } from "@/features/auth/register-wizard";

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterWizard />
    </AuthCard>
  );
}
