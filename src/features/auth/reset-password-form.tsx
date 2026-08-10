"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { resetPassword } from "@/features/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [state, setState] = React.useState<{ error?: string; success?: boolean }>({});

  function handleSubmit(formData: FormData) {
    formData.set("token", token);
    startTransition(async () => {
      const result = await resetPassword(formData);
      setState(result.success ? { success: true } : { error: result.error });
    });
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is missing or malformed. Request a new one below.
        </p>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Password updated</h1>
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Enter a new password for your account.</p>
      </div>

      <TextInput label="New Password" name="password" type="password" placeholder="Enter new password" required />
      <TextInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter new password"
        required
      />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>

      <div className="flex gap-3 rounded-lg bg-muted p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-foreground" />
        <div className="space-y-0.5 text-sm">
          <p className="font-medium text-foreground">Security Tip</p>
          <p className="text-muted-foreground">This link can only be used once and expires after 30 minutes.</p>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
