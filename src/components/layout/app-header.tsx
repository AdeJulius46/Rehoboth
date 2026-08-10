"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NAV_SECTIONS } from "@/lib/constants";
import { useSidebarMobile } from "@/components/layout/sidebar-context";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import type { NotificationsData } from "@/features/notifications/queries";

const SINGULAR: Record<string, string> = {
  Customers: "Customer",
  Agents: "Agent",
  Staffs: "Staff",
  Products: "Product",
  Warehouses: "Warehouse",
  Sales: "Sale",
  Projects: "Project",
  Invoices: "Invoice",
  Payments: "Payment",
  Expenses: "Expense",
};

function useBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const allItems = NAV_SECTIONS.flatMap((section) => section.items);
  const rootItem = allItems.find((item) => item.href === `/${segments[0]}`);
  const rootLabel = rootItem?.label ?? (segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : "");
  const singular = SINGULAR[rootLabel] ?? rootLabel;

  if (segments.length <= 1) {
    return { root: rootLabel, rootHref: rootItem?.href, trailing: null as string | null };
  }

  if (segments[1] === "new") {
    return { root: rootLabel, rootHref: rootItem?.href, trailing: `Add ${singular}` };
  }
  if (segments[2] === "edit") {
    return { root: rootLabel, rootHref: rootItem?.href, trailing: `Edit ${singular}` };
  }
  return { root: rootLabel, rootHref: rootItem?.href, trailing: `${singular} Details` };
}

export function AppHeader({ notifications }: { notifications: NotificationsData }) {
  const pathname = usePathname();
  const { root, rootHref, trailing } = useBreadcrumb(pathname);
  const { setOpen } = useSidebarMobile();

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-4.5" />
        </button>
        {trailing ? (
          <p className="min-w-0 truncate text-sm">
            <Link href={rootHref ?? "#"} className="text-muted-foreground hover:text-foreground">
              {root}
            </Link>
            <span className="mx-1.5 text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{trailing}</span>
          </p>
        ) : (
          <h1 className="truncate text-2xl font-semibold text-foreground">{root}</h1>
        )}
      </div>
      <NotificationsMenu notifications={notifications} />
    </div>
  );
}
