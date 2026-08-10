import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { createInvoice } from "@/features/invoices/actions";
import { getCustomerOptions, getAgentOptions, getProductPickerOptions } from "@/features/invoices/queries";

export default async function AddInvoicePage() {
  const [customerOptions, agentOptions, productOptions] = await Promise.all([
    getCustomerOptions(),
    getAgentOptions(),
    getProductPickerOptions(),
  ]);

  return (
    <InvoiceForm
      customerOptions={customerOptions}
      agentOptions={agentOptions}
      productOptions={productOptions}
      onSubmit={createInvoice}
    />
  );
}
