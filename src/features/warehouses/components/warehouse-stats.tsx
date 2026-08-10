import { Warehouse, Package, Boxes, AlertTriangle } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getWarehouseStats } from "@/features/warehouses/queries";

export function WarehouseStats({ stats }: { stats: Awaited<ReturnType<typeof getWarehouseStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Warehouses" value={stats.total.toLocaleString()} icon={Warehouse} />
      <StatCard label="Total Stock Value" value={formatNaira(stats.totalStockValue)} icon={Package} />
      <StatCard label="Total Stock Items" value={stats.totalStockItems.toLocaleString()} icon={Boxes} />
      <StatCard label="Low Stock Items" value={stats.lowStockItems.toLocaleString()} icon={AlertTriangle} />
    </div>
  );
}
