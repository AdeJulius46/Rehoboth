import { ShieldAlert } from "lucide-react";

import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductForm } from "@/features/products/components/product-form";
import { createProduct } from "@/features/products/actions";

export default async function AddProductPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <Card className="p-0">
          <div className="p-5">
            <EmptyState
              icon={ShieldAlert}
              title="Admins only"
              description="Only an administrator can add products."
            />
          </div>
        </Card>
      </div>
    );
  }

  return <ProductForm mode="create" onSubmit={createProduct} />;
}
