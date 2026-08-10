"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTableParams } from "@/hooks/use-table-params";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getPageNumbers(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([1, 2, pageCount - 1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push("ellipsis");
    result.push(p);
    previous = p;
  }
  return result;
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
}) {
  const { setParams } = useTableParams();
  const pageCount = Math.max(Math.ceil(totalItems / pageSize), 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Show items</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setParams({ pageSize: value ?? undefined })}
        >
          <SelectTrigger size="sm" className="w-18">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => setParams({ page: page - 1 }, { resetPage: false })}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        {getPageNumbers(page, pageCount).map((p, index) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1.5">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setParams({ page: p }, { resetPage: false })}
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => setParams({ page: page + 1 }, { resetPage: false })}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
