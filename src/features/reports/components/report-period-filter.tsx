"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTableParams } from "@/hooks/use-table-params";
import { toDateKey, type ReportPeriodKey } from "@/features/reports/period";

const PERIODS: { key: ReportPeriodKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
];

export function ReportPeriodFilter({
  period,
  from,
  to,
}: {
  period: ReportPeriodKey;
  from: string;
  to: string;
}) {
  const { setParams } = useTableParams();

  function selectPeriod(key: ReportPeriodKey) {
    if (key === "custom") {
      setParams({ period: "custom", from, to });
    } else {
      setParams({ period: key === "month" ? undefined : key, from: undefined, to: undefined });
    }
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border p-1">
        {PERIODS.map((item) => (
          <Button
            key={item.key}
            size="sm"
            className="shrink-0"
            variant={period === item.key ? "default" : "ghost"}
            onClick={() => selectPeriod(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="From date"
            className="w-auto"
            value={from}
            max={to || toDateKey(new Date())}
            onChange={(e) => e.target.value && setParams({ period: "custom", from: e.target.value, to })}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            aria-label="To date"
            className="w-auto"
            value={to}
            min={from}
            onChange={(e) => e.target.value && setParams({ period: "custom", from, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
