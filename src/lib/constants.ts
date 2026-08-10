import type { LucideIcon } from "lucide-react";
import {
  Home,
  Users,
  User,
  UsersRound,
  Package,
  Warehouse,
  ShoppingCart,
  Building2,
  ClipboardList,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

export type Role = "ADMIN" | "MANAGER" | "STAFF";

export const ROLES: Role[] = ["ADMIN", "MANAGER", "STAFF"];

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

const ALL_ROLES: Role[] = ["ADMIN", "MANAGER", "STAFF"];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home, roles: ALL_ROLES },
      { label: "Customers", href: "/customers", icon: Users, roles: ALL_ROLES },
      { label: "Agents", href: "/agents", icon: User, roles: ["ADMIN", "MANAGER"] },
      { label: "Staffs", href: "/staffs", icon: UsersRound, roles: ["ADMIN", "MANAGER"] },
      { label: "Products", href: "/products", icon: Package, roles: ALL_ROLES },
      { label: "Warehouses", href: "/warehouses", icon: Warehouse, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Sales", href: "/sales", icon: ShoppingCart, roles: ALL_ROLES },
      { label: "Projects", href: "/projects", icon: Building2, roles: ALL_ROLES },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: "/invoices", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },
      { label: "Payments", href: "/payments", icon: CreditCard, roles: ["ADMIN", "MANAGER"] },
      { label: "Expenses", href: "/expenses", icon: Wallet, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ALL_ROLES },
    ],
  },
];

export type StatusVariant = "success" | "warning" | "danger" | "neutral";

export const PERSON_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "success",
  INACTIVE: "danger",
};

export const SALE_STATUS_VARIANT: Record<string, StatusVariant> = {
  PENDING: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const PROJECT_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "success",
  COMPLETED: "neutral",
  ON_HOLD: "warning",
  CANCELLED: "danger",
};

export const INVOICE_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "neutral",
  SENT: "warning",
  PAID: "success",
  OVERDUE: "danger",
};

export const PAYMENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
};

export const EXPENSE_STATUS_VARIANT: Record<string, StatusVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};
