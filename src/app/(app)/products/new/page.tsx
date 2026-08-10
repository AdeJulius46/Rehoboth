"use client";

import { ProductForm } from "@/features/products/components/product-form";
import { createProduct } from "@/features/products/actions";

export default function AddProductPage() {
  return <ProductForm mode="create" onSubmit={createProduct} />;
}
