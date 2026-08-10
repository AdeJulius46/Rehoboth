"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { PanelLeft, Search, LogOut } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { NavItem } from "@/components/layout/nav-item";
import { UserMenu } from "@/components/layout/user-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebarMobile } from "@/components/layout/sidebar-context";
import { NAV_SECTIONS } from "@/lib/constants";
import type { Role } from "@/lib/constants";

function SidebarContent({
  user,
  onNavigate,
}: {
  user: { name: string; email: string; role: Role };
  onNavigate?: () => void;
}) {
  const [query, setQuery] = React.useState("");

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.roles.includes(user.role) &&
        item.label.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-sidebar-border p-4">
        <Logo size={44} />
        <PanelLeft className="size-5 text-muted-foreground" />
      </div>

      <div className="scrollbar-hide flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-sidebar-border px-2">
          <Search className="size-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              ))}
              {section.title === "Account" ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-danger hover:bg-sidebar-accent"
                >
                  <LogOut className="size-5 shrink-0" />
                  Log out
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-4">
        <UserMenu name={user.name} email={user.email} role={user.role} />
      </div>
    </>
  );
}

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const { open, setOpen } = useSidebarMobile();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-68 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent user={user} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="border-r border-sidebar-border p-0 lg:hidden">
          <SidebarContent user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
