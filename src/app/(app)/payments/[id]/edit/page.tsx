import { notFound } from "next/navigation";

import { PaymentEditForm } from "@/features/payments/components/payment-edit-form";
import { updatePayment } from "@/features/payments/actions";
import { getPaymentById } from "@/features/payments/queries";

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = await getPaymentById(id);

  if (!payment) {
    notFound();
  }

  return (
    <PaymentEditForm
      reference={payment.reference}
      customerName={payment.customer?.name ?? "—"}
      invoiceNumber={payment.invoice?.number ?? null}
      defaultValues={{
        amount: payment.amount,
        method: payment.method,
        date: new Date(payment.date).toISOString().slice(0, 10),
        status: payment.status,
        notes: payment.notes ?? undefined,
      }}
      onSubmit={updatePayment.bind(null, id)}
    />
  );
}
