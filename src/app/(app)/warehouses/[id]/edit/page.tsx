import { notFound } from "next/navigation";

import { WarehouseForm } from "@/features/warehouses/components/warehouse-form";
import { updateWarehouse } from "@/features/warehouses/actions";
import { getWarehouseById } from "@/features/warehouses/queries";

export default async function EditWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warehouse = await getWarehouseById(id);

  if (!warehouse) {
    notFound();
  }

  return (
    <WarehouseForm
      mode="edit"
      defaultValues={{
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.location,
        manager: warehouse.manager ?? undefined,
        status: warehouse.status as "ACTIVE" | "INACTIVE",
        phone: warehouse.phone ?? undefined,
        email: warehouse.email ?? undefined,
        notes: warehouse.notes ?? undefined,
        imageUrl: warehouse.imageUrl ?? undefined,
      }}
      onSubmit={updateWarehouse.bind(null, id)}
    />
  );
}
