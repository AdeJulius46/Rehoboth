import { notFound } from "next/navigation";

import { ProductForm } from "@/features/products/components/product-form";
import { updateProduct } from "@/features/products/actions";
import { getProductById } from "@/features/products/queries";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
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
