import { AuthCard } from "@/components/layout/auth-card";
import { ContactAdminForm } from "@/features/auth/contact-admin-form";

export default function ContactAdminPage() {
  return (
    <AuthCard>
      <ContactAdminForm />
    </AuthCard>
  );
}
