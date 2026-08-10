import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Mail, MapPin, Phone, ShoppingCart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PERSON_STATUS_VARIANT, SALE_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getAgentById } from "@/features/agents/queries";
import { AgentDetailActions } from "@/features/agents/components/agent-detail-actions";
import { getRecentSalesByAgent } from "@/features/sales/queries";

const SALE_STATUS_LABELS: Record<string, string> = { PENDING: "Pending", COMPLETED: "Completed", CANCELLED: "Cancelled" };

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    notFound();
  }

  const recentSales = await getRecentSalesByAgent(id);

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={agent.imageUrl ?? undefined} />
              <AvatarFallback>{initials(agent.name)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{agent.name}</h1>
              <StatusBadge
                label={agent.status === "ACTIVE" ? "Active" : "Inactive"}
                variant={PERSON_STATUS_VARIANT[agent.status]}
              />
            </div>
          </div>
          <AgentDetailActions id={agent.id} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Phone className="size-4" />
            {agent.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" />
            {agent.email}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {agent.region}
          </span>
        </div>

        <div className="flex gap-2">
          <StatusBadge label={agent.agentType === "SALES" ? "Sales Agent" : "Collection Agent"} variant="success" />
          <StatusBadge label={`${agent.region} Territory`} variant="warning" />
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-0 lg:col-span-1">
              <div className="space-y-4 p-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Territory</p>
                  <p className="text-foreground">{agent.region}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission Rate</p>
                  <p className="text-foreground">{Number(agent.commissionRate)}%</p>
                </div>
                {agent.bankName ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Bank</p>
                    <p className="text-foreground">
                      {agent.bankName} — {agent.accountNumber} ({agent.accountName})
                    </p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="p-0 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Recent Sales</h3>
              </div>
              <div className="p-5 pt-0">
                {recentSales.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentSales.map((sale) => (
                      <Link
                        key={sale.id}
                        href={`/sales/${sale.id}`}
                        className="flex items-center justify-between py-2.5 text-sm hover:text-primary"
                      >
                        <div>
                          <p className="font-medium text-foreground">{sale.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {sale.customerName} · {formatDate(sale.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">{formatNaira(sale.total)}</span>
                          <StatusBadge label={SALE_STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={ShoppingCart} title="No sales yet" description="Sales for this agent will appear here." />
                )}
              </div>
            </Card>
          </div>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 pb-4">
              <h3 className="font-semibold text-foreground">Recent Collections</h3>
            </div>
            <div className="p-5 pt-0">
              <EmptyState icon={CreditCard} title="No collections yet" description="Collections will appear here once the Payments module is built." />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card className="p-0">
            <div className="p-5">
              {recentSales.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentSales.map((sale) => (
                    <Link
                      key={sale.id}
                      href={`/sales/${sale.id}`}
                      className="flex items-center justify-between py-2.5 text-sm hover:text-primary"
                    >
                      <div>
                        <p className="font-medium text-foreground">{sale.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.customerName} · {formatDate(sale.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground">{formatNaira(sale.total)}</span>
                        <StatusBadge label={SALE_STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingCart} title="No sales yet" description="Sales for this agent will appear here." />
              )}
            </div>
          </Card>
        </TabsContent>

        {["collections", "customers", "payment", "notes"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0">
              <div className="p-5">
                <EmptyState
                  icon={ShoppingCart}
                  title={`No ${tab} yet`}
                  description="This section will be available once the related module is built."
                />
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
