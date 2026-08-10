export function StepBadge({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary">
      {step} of {total} Steps ~ {label}
    </span>
  );
}
