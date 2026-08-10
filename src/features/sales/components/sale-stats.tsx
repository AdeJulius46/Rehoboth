import { Wallet, ShoppingCart, Users, Clock } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getSaleStats } from "@/features/sales/queries";

export function SaleStats({ stats }: { stats: Awaited<ReturnType<typeof getSaleStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Revenue" value={formatNaira(stats.totalRevenue)} icon={Wallet} />
      <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} />
      <StatCard label="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} />
      <StatCard label="Pending Sales" value={stats.pendingSales.toLocaleString()} icon={Clock} />
    </div>
  );
}
