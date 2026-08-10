"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { requestPasswordReset } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition();
  const [state, setState] = React.useState<{ error?: string; success?: boolean }>({});

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (!result.success) {
        setState({ error: result.error });
        return;
      }
      setState({ success: true });
      if (result.data.devResetToken) {
        const link = `${window.location.origin}/reset-password?token=${result.data.devResetToken}`;
        toast.info(`Dev mode — your reset link is ${link}`, { duration: 15000 });
      } else {
        toast.success("Reset link sent — check your email.");
      }
    });
  }

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <TextInput
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        error={state.error}
        required
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send Reset Link"}
      </Button>

      <div className="flex gap-3 rounded-lg bg-muted p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-foreground" />
        <div className="space-y-0.5 text-sm">
          <p className="font-medium text-foreground">Security Tip</p>
          <p className="text-muted-foreground">
            Make sure to use the email address associated with your account.
          </p>
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
