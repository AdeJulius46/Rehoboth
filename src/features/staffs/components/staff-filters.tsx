"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/hooks/use-table-params";

const DEPARTMENT_ITEMS = {
  all: "All Type",
  Sales: "Sales",
  Operations: "Operations",
  Finance: "Finance",
  Warehouse: "Warehouse",
  IT: "IT",
  Management: "Management",
  HR: "HR",
  Other: "Other",
};
const STATUS_ITEMS = { all: "All Status", ACTIVE: "Active", INACTIVE: "Inactive" };

export function StaffFilters() {
  const { params, setParams } = useTableParams();

  return (
    <>
      <Select
        items={DEPARTMENT_ITEMS}
        value={params.department ?? "all"}
        onValueChange={(value) => setParams({ department: !value || value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DEPARTMENT_ITEMS).map(([value, label]) => (
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
