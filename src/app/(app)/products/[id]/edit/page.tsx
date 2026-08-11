import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductForm } from "@/features/products/components/product-form";
import { updateProduct } from "@/features/products/actions";
import { getProductById } from "@/features/products/queries";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <Card className="p-0">
          <div className="p-5">
            <EmptyState
              icon={ShieldAlert}
              title="Admins only"
              description="Only an administrator can edit products."
            />
          </div>
        </Card>
      </div>
    );
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      defaultValues={{
        name: product.name,
        sku: product.sku,
        category: product.category,
        brand: product.brand ?? undefined,
        unit: product.unit,
        description: product.description ?? undefined,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        openingStock: product.quantity,
        reorderLevel: product.reorderLevel,
        imageUrl: product.imageUrl ?? undefined,
      }}
      onSubmit={updateProduct.bind(null, id)}
    />
  );
}
