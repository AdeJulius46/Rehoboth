import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Activity, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNaira } from "@/lib/currency";
import { getProductById } from "@/features/products/queries";
import { ProductDetailActions } from "@/features/products/components/product-detail-actions";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const stockStatus =
    product.quantity <= 0 ? "Out of stock" : product.quantity <= product.reorderLevel ? "Low Stock" : "In Stock";
  const stockVariant = product.quantity <= 0 ? "danger" : product.quantity <= product.reorderLevel ? "warning" : "success";
  const stockValue = product.quantity * product.costPrice;

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={product.imageUrl ?? undefined} />
              <AvatarFallback className="rounded-lg">{product.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{product.name}</h1>
              <StatusBadge label={product.status === "ACTIVE" ? "Active" : "Inactive"} variant={product.status === "ACTIVE" ? "success" : "danger"} />
            </div>
          </div>
          <ProductDetailActions id={product.id} />
        </div>

        {product.description ? <p className="text-sm text-muted-foreground">{product.description}</p> : null}

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Unit price</p>
            <p className="font-medium text-foreground">{formatNaira(product.sellingPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cost price</p>
            <p className="font-medium text-foreground">{formatNaira(product.costPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock Quantity</p>
            <p className="font-medium text-foreground">
              {product.quantity} {product.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock Value</p>
            <p className="font-medium text-foreground">{formatNaira(stockValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reorder Level</p>
            <p className="font-medium text-foreground">
              {product.reorderLevel} {product.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unit</p>
            <p className="font-medium text-foreground">{product.unit}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Status</h3>
              </div>
              <div className="space-y-4 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Stock Status</p>
                  <StatusBadge label={stockStatus} variant={stockVariant} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Date Added</p>
                  <p className="text-foreground">{format(product.createdAt, "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-foreground">{format(product.updatedAt, "MMM d, yyyy")}</p>
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Stock by Warehouse</h3>
              </div>
              <div className="p-5 pt-0">
                {product.stock.length === 0 ? (
                  <EmptyState icon={Package} title="No stock recorded" description="This product has no stock in any warehouse yet." />
                ) : (
                  <div className="space-y-3 pt-4">
                    {product.stock.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{s.warehouse.name}</span>
                        <span className="text-muted-foreground">
                          {s.quantity} {product.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card className="p-0">
            <div className="p-5">
              <EmptyState icon={Activity} title="No sales yet" description="Sales will appear here once the Sales module is built." />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
