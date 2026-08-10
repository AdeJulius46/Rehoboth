"use client";

import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TextInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

export function TextInput({
  label,
  icon: Icon,
  hint,
  error,
  containerClassName,
  className,
  type = "text",
  id,
  ...props
}: TextInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isPassword = type === "password";

  return (
    <div className={cn("grid gap-1.5", containerClassName)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}
        <Input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={!!error}
          className={cn(Icon && "pl-8", isPassword && "pr-8", className)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
