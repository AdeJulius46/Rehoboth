"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";
import { EXPENSE_CATEGORIES } from "@/features/expenses/constants";

const STATUS_ITEMS = { all: "All Status", PENDING: "Pending", APPROVED: "Paid", REJECTED: "Rejected" };
const CATEGORY_ITEMS = { all: "All Type", ...Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, c])) };

export function ExpenseFilters() {
  const { params, setParams } = useTableParams();

  return (
    <>
      <Select
        items={CATEGORY_ITEMS}
        value={params.category ?? "all"}
        onValueChange={(value) => setParams({ category: !value || value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CATEGORY_ITEMS).map(([value, label]) => (
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
