"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";
import { PRODUCT_CATEGORIES } from "@/features/products/constants";

const STATUS_ITEMS = { all: "All Status", ACTIVE: "Active", INACTIVE: "Inactive" };

export function ProductFilters() {
  const { params, setParams } = useTableParams();
  const categoryItems = { all: "All Type", ...Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c, c])) };

  return (
    <>
      <Select
        items={categoryItems}
        value={params.category ?? "all"}
        onValueChange={(value) => setParams({ category: !value || value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(categoryItems).map(([value, label]) => (
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
