import { PaymentForm } from "@/features/payments/components/payment-form";
import { createPayment } from "@/features/payments/actions";
import { getCustomerOptions, getInvoiceOptions } from "@/features/payments/queries";

export default async function AddPaymentPage() {
  const [customerOptions, invoiceOptions] = await Promise.all([getCustomerOptions(), getInvoiceOptions()]);

  return (
    <PaymentForm customerOptions={customerOptions} invoiceOptions={invoiceOptions} onSubmit={createPayment} />
  );
}
