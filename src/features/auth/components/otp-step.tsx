"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { sendVerificationCode, verifyRegistrationCode } from "@/features/auth/register-actions";

const RESEND_COOLDOWN_SECONDS = 179;

export function OtpStep({
  email,
  onVerified,
  onChangeEmail,
}: {
  email: string;
  onVerified: () => void;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [cooldown, setCooldown] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const hasSentInitialCode = React.useRef(false);

  const requestCode = React.useCallback(() => {
    startTransition(async () => {
      const result = await sendVerificationCode(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
      if (result.data.devCode) {
        toast.info(`Dev mode — your security code is ${result.data.devCode}`);
      } else {
        toast.success(`Verification code sent to ${email}`);
      }
    });
  }, [email]);

  React.useEffect(() => {
    if (hasSentInitialCode.current) return;
    hasSentInitialCode.current = true;
    requestCode();
  }, [requestCode]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyRegistrationCode(email, code);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onVerified();
    });
  }

  const minutes = String(Math.floor(cooldown / 60)).padStart(2, "0");
  const seconds = String(cooldown % 60).padStart(2, "0");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Check your inbox!</h1>
        <p className="text-sm text-muted-foreground">
          We have just sent a security code to your email ({email}), check it now and enter the
          code here to continue
        </p>
      </div>

      <TextInput label="Email" value={email} disabled />
      <TextInput
        label="Security code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        hint="Please don't give this code to anyone"
        error={error ?? undefined}
        required
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Verifying..." : "Continue"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={cooldown > 0 || isPending}
        onClick={requestCode}
      >
        {cooldown > 0 ? `Next code available in ${minutes}:${seconds}` : "Resend code"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Use wrong email?{" "}
        <button type="button" className="font-medium text-primary hover:underline" onClick={onChangeEmail}>
          Change email
        </button>
      </p>
    </form>
  );
}
