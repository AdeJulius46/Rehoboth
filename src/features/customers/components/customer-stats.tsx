import { Users, UserCheck, UserX, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getCustomerStats } from "@/features/customers/queries";

export function CustomerStats({
  stats,
}: {
  stats: Awaited<ReturnType<typeof getCustomerStats>>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Customers" value={stats.total.toLocaleString()} icon={Users} />
      <StatCard label="Active Customers" value={stats.active.toLocaleString()} icon={UserCheck} />
      <StatCard label="Inactive Customers" value={stats.inactive.toLocaleString()} icon={UserX} />
      <StatCard label="Total Outstanding" value={formatNaira(stats.totalOutstanding)} icon={Wallet} />
    </div>
  );
}
