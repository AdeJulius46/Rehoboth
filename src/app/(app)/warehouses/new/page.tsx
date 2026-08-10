"use client";

import { WarehouseForm } from "@/features/warehouses/components/warehouse-form";
import { createWarehouse } from "@/features/warehouses/actions";

export default function AddWarehousePage() {
  return <WarehouseForm mode="create" onSubmit={createWarehouse} />;
}
