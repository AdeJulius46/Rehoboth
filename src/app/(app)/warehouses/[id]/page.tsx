import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Activity, Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getAvailableProductsForWarehouse, getWarehouseById } from "@/features/warehouses/queries";
import { WarehouseDetailActions } from "@/features/warehouses/components/warehouse-detail-actions";
import { StockSummary } from "@/features/warehouses/components/stock-summary";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warehouse = await getWarehouseById(id);

  if (!warehouse) {
    notFound();
  }

  const availableProducts = await getAvailableProductsForWarehouse(id);

  const stockRows = warehouse.stock.map((s) => ({
    id: s.id,
    quantity: s.quantity,
    product: {
      id: s.product.id,
      name: s.product.name,
      sku: s.product.sku,
      unit: s.product.unit,
      reorderLevel: s.product.reorderLevel,
    },
  }));

  const totalItems = warehouse.stock.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = warehouse.stock.reduce((sum, s) => sum + s.quantity * Number(s.product.costPrice), 0);
  const lowStockItems = warehouse.stock.filter((s) => s.quantity > 0 && s.quantity <= s.product.reorderLevel).length;
  const outOfStockItems = warehouse.stock.filter((s) => s.quantity === 0).length;

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={warehouse.imageUrl ?? undefined} />
              <AvatarFallback>{initials(warehouse.name)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{warehouse.name}</h1>
              <StatusBadge
                label={warehouse.status === "ACTIVE" ? "Active" : "Inactive"}
                variant={PERSON_STATUS_VARIANT[warehouse.status]}
              />
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Items in Stock</p>
                <p className="font-medium text-foreground">{totalItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Value</p>
                <p className="font-medium text-foreground">{formatNaira(totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date Created</p>
                <p className="font-medium text-foreground">{format(warehouse.createdAt, "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">{format(warehouse.updatedAt, "MMM d, yyyy")}</p>
              </div>
            </div>
            <WarehouseDetailActions id={warehouse.id} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {warehouse.phone ? (
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" />
              {warehouse.phone}
            </span>
          ) : null}
          {warehouse.email ? (
            <span className="flex items-center gap-1.5">
              <Mail className="size-4" />
              {warehouse.email}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {warehouse.location}
          </span>
        </div>

        {warehouse.manager ? (
          <div>
            <StatusBadge label={`Managed by: ${warehouse.manager}`} variant="neutral" />
          </div>
        ) : null}
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Summary</TabsTrigger>
          <TabsTrigger value="transfers">Stock Transfers</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 pb-4">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Total items</p>
                <p className="text-lg font-semibold text-foreground">{totalItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold text-foreground">{formatNaira(totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock Items</p>
                <p className="text-lg font-semibold text-foreground">{lowStockItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Out of Stock Items</p>
                <p className="text-lg font-semibold text-foreground">{outOfStockItems}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <StockSummary warehouseId={warehouse.id} stock={stockRows} availableProducts={availableProducts} />
        </TabsContent>

        {["transfers", "activity"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0">
              <div className="p-5">
                <EmptyState
                  icon={Activity}
                  title={`No ${tab} data yet`}
                  description="This section will be available once Products are added and stock movements begin."
                />
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
