import { notFound } from "next/navigation";

import { CustomerForm } from "@/features/customers/components/customer-form";
import { updateCustomer } from "@/features/customers/actions";
import { getCustomerById } from "@/features/customers/queries";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerForm
      mode="edit"
      defaultValues={{
        name: customer.name,
        companyName: customer.companyName ?? undefined,
        phone: customer.phone,
        email: customer.email,
        type: customer.type,
        taxId: customer.taxId ?? undefined,
        address: customer.address ?? undefined,
        creditLimit: customer.creditLimit ? Number(customer.creditLimit) : undefined,
        openingBalance: Number(customer.openingBalance),
        imageUrl: customer.imageUrl ?? undefined,
      }}
      onSubmit={updateCustomer.bind(null, id)}
    />
  );
}
