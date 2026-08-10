import { Package, CheckCircle2, AlertTriangle, XCircle, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getProductStats } from "@/features/products/queries";

export function ProductStats({ stats }: { stats: Awaited<ReturnType<typeof getProductStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Products" value={stats.total.toLocaleString()} icon={Package} />
      <StatCard label="Active Products" value={stats.active.toLocaleString()} icon={CheckCircle2} />
      <StatCard label="Low Stock" value={stats.lowStock.toLocaleString()} icon={AlertTriangle} />
      <StatCard label="Out of Stock" value={stats.outOfStock.toLocaleString()} icon={XCircle} />
      <StatCard label="Total value in stock" value={formatNaira(stats.totalValue)} icon={Wallet} />
    </div>
  );
}
