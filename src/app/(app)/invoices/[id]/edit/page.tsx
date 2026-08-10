import { notFound } from "next/navigation";

import { InvoiceEditForm } from "@/features/invoices/components/invoice-edit-form";
import { updateInvoice } from "@/features/invoices/actions";
import { getInvoiceById, getAgentOptions } from "@/features/invoices/queries";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, agentOptions] = await Promise.all([getInvoiceById(id), getAgentOptions()]);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceEditForm
      number={invoice.number}
      customerName={invoice.customer.name}
      items={invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        lineTotal: item.lineTotal,
      }))}
      total={invoice.total}
      agentOptions={agentOptions}
      defaultValues={{
        agentId: invoice.agentId ?? "",
        dueDate: new Date(invoice.dueDate).toISOString().slice(0, 10),
        paymentTerm: invoice.paymentTerm ?? undefined,
        status: invoice.status,
        notes: invoice.notes ?? undefined,
      }}
      onSubmit={updateInvoice.bind(null, id)}
    />
  );
}
