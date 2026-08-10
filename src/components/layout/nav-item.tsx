"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function NavItem({
  href,
  label,
  icon: Icon,
  danger,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : danger
            ? "text-danger hover:bg-sidebar-accent"
            : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {isActive ? <span className="h-4 w-0.5 shrink-0 rounded-full bg-white" /> : null}
    </Link>
  );
}
