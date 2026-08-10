"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductFormInput, type ProductInput } from "@/features/products/schema";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "@/features/products/constants";

export function ProductForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ProductFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { category: "", unit: "", openingStock: 0, reorderLevel: 0, ...defaultValues },
  });

  const category = watch("category");
  const unit = watch("unit");
  const imageUrl = watch("imageUrl");

  async function submit(data: ProductInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    });

    const result = await onSubmit(formData);
    if (result && !result.success) {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and add new product" : "Update the product's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save Product" : "Save Changes"}
          </Button>
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={(url) => setValue("imageUrl", url)}
        label="Product"
        icon={Package}
      />

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextInput
            label="Product Code"
            placeholder="Auto generated if left blank"
            error={errors.sku?.message}
            {...register("sku")}
          />

          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select
              items={Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c, c]))}
              value={category}
              onValueChange={(value) => setValue("category", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? <p className="text-xs text-destructive">{errors.category.message}</p> : null}
          </div>

          <TextInput label="Brand" placeholder="Enter brand" error={errors.brand?.message} {...register("brand")} />

          <div className="grid gap-1.5">
            <Label>Unit</Label>
            <Select
              items={Object.fromEntries(PRODUCT_UNITS.map((u) => [u, u]))}
              value={unit}
              onValueChange={(value) => setValue("unit", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit ? <p className="text-xs text-destructive">{errors.unit.message}</p> : null}
          </div>

          <div className="sm:col-span-2 grid gap-1.5">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Enter product description" {...register("description")} />
          </div>

          <TextInput
            label="Cost Price (₦)"
            type="number"
            placeholder="Enter Cost Price"
            error={errors.costPrice?.message}
            {...register("costPrice")}
          />
          <TextInput
            label="Selling Price (₦)"
            type="number"
            placeholder="Enter Selling Price"
            error={errors.sellingPrice?.message}
            {...register("sellingPrice")}
          />

          <TextInput
            label="Opening Stock"
            type="number"
            placeholder="Enter Quantity"
            error={errors.openingStock?.message}
            {...register("openingStock")}
            disabled={mode === "edit"}
            hint={mode === "edit" ? "Stock adjustments happen via the Warehouses module" : undefined}
          />
          <TextInput
            label="Reorder Level"
            type="number"
            placeholder="Enter reorder level"
            error={errors.reorderLevel?.message}
            {...register("reorderLevel")}
          />
        </div>
      </Card>
    </form>
  );
}
