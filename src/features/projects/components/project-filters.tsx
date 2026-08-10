"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";

const STATUS_ITEMS = {
  all: "All Status",
  ACTIVE: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function ProjectFilters() {
  const { params, setParams } = useTableParams();

  return (
    <Select
      items={STATUS_ITEMS}
      value={params.status ?? "all"}
      onValueChange={(value) => setParams({ status: !value || value === "all" ? undefined : value })}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_ITEMS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
