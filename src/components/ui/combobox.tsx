"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ComboboxOption = { value: string; label: string; description?: string };

const LIST_MAX_HEIGHT = 256;
const LIST_MIN_HEIGHT = 96;
/** Search input row plus the popover gap and a little breathing room. */
const POPUP_CHROME = 80;

/**
 * On phones the keyboard covers the bottom of the screen without resizing the
 * page, so a dropdown placed by page size ends up hidden behind it. Fit the list
 * into the visible area instead, opening upwards when there is more room above.
 */
function fitToVisibleArea(trigger: HTMLElement | null) {
  const fallback = { side: "bottom" as const, maxHeight: LIST_MAX_HEIGHT };
  if (!trigger || typeof window === "undefined") return fallback;

  const viewport = window.visualViewport;
  const visibleTop = viewport?.offsetTop ?? 0;
  const visibleBottom = visibleTop + (viewport?.height ?? window.innerHeight);
  const rect = trigger.getBoundingClientRect();
  const below = visibleBottom - rect.bottom - POPUP_CHROME;
  const above = rect.top - visibleTop - POPUP_CHROME;

  const clamp = (space: number) => Math.min(LIST_MAX_HEIGHT, Math.max(LIST_MIN_HEIGHT, space));
  return below >= above || below >= LIST_MAX_HEIGHT * 0.6
    ? { side: "bottom" as const, maxHeight: clamp(below) }
    : { side: "top" as const, maxHeight: clamp(above) };
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [placement, setPlacement] = React.useState<{ side: "top" | "bottom"; maxHeight: number }>({
    side: "bottom",
    maxHeight: LIST_MAX_HEIGHT,
  });

  React.useEffect(() => {
    if (!open) return;
    const update = () => setPlacement(fitToVisibleArea(triggerRef.current));
    update();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const filtered = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            className={cn(
              "w-full min-w-0 justify-between font-normal",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <span className="min-w-0 truncate">{selected ? selected.label : placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" side={placement.side} className="w-(--anchor-width) p-0">
        <div className="p-2">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="scrollbar-hide overflow-y-auto p-1 pt-0" style={{ maxHeight: placement.maxHeight }}>
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.slice(0, 100).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
                  option.value === value && "bg-accent",
                )}
              >
                <Check className={cn("size-4 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} />
                <span className="flex-1 truncate">{option.label}</span>
                {option.description ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
