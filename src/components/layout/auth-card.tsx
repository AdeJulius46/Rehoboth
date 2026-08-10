import { Logo } from "@/components/layout/logo";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-16">
      <Logo size={80} />
      <div className="mt-10 w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
