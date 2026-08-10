"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, ClipboardList, Clock, ShoppingCart, UserPlus, Wallet } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNaira } from "@/lib/currency";
import type { NotificationsData } from "@/features/notifications/queries";

export function NotificationsMenu({ notifications }: { notifications: NotificationsData }) {
  const router = useRouter();
  const { lowStock, overdueInvoices, recentPayments, recentSales, pendingExpenses, newStaff, totalCount } =
    notifications;

  const sections = [
    {
      label: "Stock Alerts",
      items: lowStock.map((item) => ({
        key: item.id,
        icon: <AlertTriangle className={item.status === "out" ? "text-destructive" : "text-warning"} />,
        text:
          item.status === "out"
            ? `${item.name} is out of stock`
            : `${item.name} is low on stock (${item.quantity} left)`,
        href: `/products/${item.productId}`,
      })),
    },
    {
      label: "Overdue Invoices",
      items: overdueInvoices.map((inv) => ({
        key: inv.id,
        icon: <Clock className="text-destructive" />,
        text: `Invoice ${inv.number} is overdue (${formatNaira(inv.total)})`,
        href: `/invoices/${inv.id}`,
      })),
    },
    {
      label: "Recent Payments",
      items: recentPayments.map((p) => ({
        key: p.id,
        icon: <Wallet className="text-success" />,
        text: `Payment received: ${p.reference} (${formatNaira(p.amount)})`,
        href: `/payments/${p.id}`,
      })),
    },
    {
      label: "Recent Sales",
      items: recentSales.map((s) => ({
        key: s.id,
        icon: <ShoppingCart className="text-primary" />,
        text: `New sale: ${s.number} for ${s.customerName} (${formatNaira(s.total)})`,
        href: `/sales/${s.id}`,
      })),
    },
    {
      label: "Pending Approvals",
      items: pendingExpenses.map((e) => ({
        key: e.id,
        icon: <ClipboardList className="text-warning" />,
        text: `${e.description} (${formatNaira(e.amount)}) awaiting approval`,
        href: `/expenses/${e.id}`,
      })),
    },
    {
      label: "New Staff",
      items: newStaff.map((s) => ({
        key: s.id,
        icon: <UserPlus className="text-primary" />,
        text: `New staff added: ${s.name}`,
        href: `/staffs/${s.id}`,
      })),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4.5" />
        {totalCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] sm:w-96">
        {sections.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        ) : (
          sections.map((section, index) => (
            <React.Fragment key={section.label}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                {section.items.map((item) => (
                  <DropdownMenuItem key={item.key} onClick={() => router.push(item.href)}>
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate">{item.text}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </React.Fragment>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
