"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";

const TYPE_ITEMS = { all: "All Type", INDIVIDUAL: "Individual", BUSINESS: "Company" };
const STATUS_ITEMS = { all: "All Status", ACTIVE: "Active", INACTIVE: "Inactive" };

export function CustomerFilters() {
  const { params, setParams } = useTableParams();

  return (
    <>
      <Select
        items={TYPE_ITEMS}
        value={params.type ?? "all"}
        onValueChange={(value) => setParams({ type: !value || value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TYPE_ITEMS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
    </>
  );
}
