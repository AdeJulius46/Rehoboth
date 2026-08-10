"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";

const PERIOD_ITEMS = { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" };

export function ReportPeriodFilter() {
  const { params, setParams } = useTableParams();

  return (
    <Select
      items={PERIOD_ITEMS}
      value={params.days ?? "30"}
      onValueChange={(value) => setParams({ days: !value ? undefined : value })}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PERIOD_ITEMS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
