import { Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getPaymentStats } from "@/features/payments/queries";

export function PaymentStats({ stats }: { stats: Awaited<ReturnType<typeof getPaymentStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Payments" value={formatNaira(stats.total)} icon={Wallet} />
      <StatCard label="Received Payment" value={formatNaira(stats.received)} icon={CheckCircle2} />
      <StatCard label="Pending Payments" value={formatNaira(stats.pending)} icon={Clock} />
      <StatCard label="Failed Payments" value={formatNaira(stats.failed)} icon={XCircle} />
    </div>
  );
}
