"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createAccountSchema, type CreateAccountInput } from "@/features/auth/schema";
import { checkEmailAvailable } from "@/features/auth/register-actions";

export function CreateAccountStep({
  onContinue,
}: {
  onContinue: (data: CreateAccountInput) => void;
}) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeToTerms, setAgreeToTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = createAccountSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      agreeToTerms,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }

    startTransition(async () => {
      const availability = await checkEmailAvailable(parsed.data.email);
      if (!availability.success) {
        setErrors({ email: availability.error });
        return;
      }
      setErrors({});
      onContinue(parsed.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Create Your Account</h1>
        <p className="text-sm text-muted-foreground">Get started with REHOBOTH</p>
      </div>

      <TextInput
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <TextInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextInput
        label="Password"
        type="password"
        placeholder="Create password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <TextInput
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />

      <div className="grid gap-1.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="agree-to-terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
          />
          <Label htmlFor="agree-to-terms" className="font-normal text-muted-foreground">
            I agree to the{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms ? <p className="text-xs text-destructive">{errors.agreeToTerms}</p> : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Account"}
      </Button>

      <div className="relative py-2 text-center text-xs text-muted-foreground">
        <span className="relative bg-card px-2">Or continue with</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" disabled>
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an Account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
