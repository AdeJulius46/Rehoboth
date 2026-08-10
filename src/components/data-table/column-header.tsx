"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTableParams } from "@/hooks/use-table-params";

export function ColumnHeader({ label, sortKey }: { label: string; sortKey?: string }) {
  const { params, setParams } = useTableParams();

  if (!sortKey) {
    return <span>{label}</span>;
  }

  const isActive = params.sortBy === sortKey;
  const direction = isActive ? params.sortDir : undefined;

  function toggleSort() {
    if (!isActive) {
      setParams({ sortBy: sortKey, sortDir: "asc" }, { resetPage: false });
    } else if (direction === "asc") {
      setParams({ sortBy: sortKey, sortDir: "desc" }, { resetPage: false });
    } else {
      setParams({ sortBy: undefined, sortDir: undefined }, { resetPage: false });
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSort}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground",
        isActive && "text-foreground",
      )}
    >
      {label}
      {isActive && direction === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : isActive && direction === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />
      )}
    </button>
  );
}
