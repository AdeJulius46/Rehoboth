import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-10 px-6 py-16">
        <Logo size={72} />
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 size-80 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
              <span className="size-2.5 rounded-full bg-danger/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
            </div>
            <div className="space-y-3 p-4">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 rounded-lg bg-muted" />
                <div className="h-14 rounded-lg bg-muted" />
              </div>
              <div className="h-28 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
