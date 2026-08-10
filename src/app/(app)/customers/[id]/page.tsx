import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CreditCard, Mail, MapPin, Phone, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PERSON_STATUS_VARIANT, SALE_STATUS_VARIANT, PROJECT_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getCustomerById } from "@/features/customers/queries";
import { CustomerDetailActions } from "@/features/customers/components/customer-detail-actions";
import { getRecentSalesByCustomer } from "@/features/sales/queries";
import { getProjectsByCustomer } from "@/features/projects/queries";

const SALE_STATUS_LABELS: Record<string, string> = { PENDING: "Pending", COMPLETED: "Completed", CANCELLED: "Cancelled" };
const PROJECT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const [recentSales, projects] = await Promise.all([
    getRecentSalesByCustomer(id),
    getProjectsByCustomer(id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={customer.imageUrl ?? undefined} />
              <AvatarFallback>{initials(customer.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">{customer.name}</h1>
                <StatusBadge
                  label={customer.status === "ACTIVE" ? "Active" : "Inactive"}
                  variant={PERSON_STATUS_VARIANT[customer.status]}
                />
              </div>
            </div>
          </div>
          <CustomerDetailActions id={customer.id} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Phone className="size-4" />
            {customer.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" />
            {customer.email}
          </span>
          {customer.address ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {customer.address}
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <StatusBadge
            label={customer.type === "BUSINESS" ? "Company" : "Individual"}
            variant={customer.type === "BUSINESS" ? "success" : "neutral"}
          />
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-0 lg:col-span-1">
              <div className="space-y-4 p-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-foreground">{customer.address || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-foreground">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="text-foreground">{customer.email}</p>
                </div>
                {customer.companyName ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-foreground">{customer.companyName}</p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="p-0 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Recent Sales</h3>
                <Button variant="outline" size="sm" render={<Link href="/sales" />} nativeButton={false}>
                  View All
                </Button>
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
                          <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">{formatNaira(sale.total)}</span>
                          <StatusBadge label={SALE_STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={ShoppingCart} title="No sales yet" description="Sales for this customer will appear here." />
                )}
              </div>
            </Card>
          </div>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 pb-4">
              <h3 className="font-semibold text-foreground">Recent Payments</h3>
            </div>
            <div className="p-5 pt-0">
              <EmptyState icon={CreditCard} title="No payments yet" description="Payments will appear here once the Payments module is built." />
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
                        <p className="text-xs text-muted-foreground">{formatDate(sale.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground">{formatNaira(sale.total)}</span>
                        <StatusBadge label={SALE_STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingCart} title="No sales yet" description="Sales for this customer will appear here." />
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card className="p-0">
            <div className="p-5">
              {projects.length > 0 ? (
                <div className="divide-y divide-border">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between py-2.5 text-sm hover:text-primary"
                    >
                      <div>
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.code}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground">{formatNaira(project.budget)}</span>
                        <StatusBadge
                          label={PROJECT_STATUS_LABELS[project.status]}
                          variant={PROJECT_STATUS_VARIANT[project.status]}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Building2} title="No projects yet" description="Projects for this customer will appear here." />
              )}
            </div>
          </Card>
        </TabsContent>

        {["invoices", "payments", "notes"].map((tab) => (
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
