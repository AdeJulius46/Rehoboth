import { ClipboardList, FileText, Wallet, AlertTriangle } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getInvoiceStats } from "@/features/invoices/queries";

export function InvoiceStats({ stats }: { stats: Awaited<ReturnType<typeof getInvoiceStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Invoices" value={stats.total.toLocaleString()} icon={ClipboardList} />
      <StatCard label="Total Invoiced" value={formatNaira(stats.totalInvoiced)} icon={FileText} />
      <StatCard label="Total Paid" value={formatNaira(stats.totalPaid)} icon={Wallet} />
      <StatCard label="Total Outstanding" value={formatNaira(stats.totalOutstanding)} icon={Wallet} />
      <StatCard label="Overdue Invoices" value={stats.overdue.toLocaleString()} icon={AlertTriangle} />
    </div>
  );
}
