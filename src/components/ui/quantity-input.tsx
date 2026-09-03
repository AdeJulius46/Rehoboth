"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

type QuantityInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "min" | "max"
> & {
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
};

/**
 * Whole-number input that doesn't fight you mid-edit.
 *
 * Clamping a controlled number input on every keystroke breaks small ranges:
 * clearing the box snaps it straight back to `min`, and typing a digit beside
 * the existing one briefly forms a bigger number that gets clamped to `max`
 * (with stock 9, typing "4" over the default "1" reads as 14 and lands on 9).
 *
 * So the raw text is kept while the field is being edited and only clamped on
 * blur. Focusing also selects the current value, so typing replaces it rather
 * than appending to it.
 */
export function QuantityInput({ value, min = 1, max, onValueChange, ...props }: QuantityInputProps) {
  const [draft, setDraft] = React.useState<string | null>(null);

  function clamp(n: number) {
    const whole = Math.floor(n);
    if (max !== undefined && whole > max) return max;
    if (whole < min) return min;
    return whole;
  }

  return (
    <Input
      {...props}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft ?? String(value)}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);

        // Keep totals live while typing, but only once the value is already in
        // range — anything else waits for blur so it isn't clamped mid-keystroke.
        const parsed = Number(raw);
        if (raw.trim() !== "" && Number.isFinite(parsed) && clamp(parsed) === Math.floor(parsed)) {
          onValueChange(Math.floor(parsed));
        }
      }}
      onBlur={(e) => {
        const raw = e.target.value;
        const parsed = Number(raw);
        onValueChange(raw.trim() === "" || !Number.isFinite(parsed) ? min : clamp(parsed));
        setDraft(null);
      }}
    />
  );
}
