import { notFound } from "next/navigation";

import { SaleEditForm } from "@/features/sales/components/sale-edit-form";
import { updateSale } from "@/features/sales/actions";
import { getSaleById, getAgentOptions } from "@/features/sales/queries";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [sale, agentOptions] = await Promise.all([getSaleById(id), getAgentOptions()]);

  if (!sale) {
    notFound();
  }

  return (
    <SaleEditForm
      number={sale.number}
      customerName={sale.customer.name}
      warehouseName={sale.warehouse?.name ?? "—"}
      items={sale.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        lineTotal: item.lineTotal,
      }))}
      total={sale.total}
      agentOptions={agentOptions}
      defaultValues={{
        agentId: sale.agentId ?? "",
        date: new Date(sale.date).toISOString().slice(0, 10),
        paymentMethod: sale.paymentMethod ?? undefined,
        status: sale.status,
        notes: sale.notes ?? undefined,
      }}
      onSubmit={updateSale.bind(null, id)}
    />
  );
}
