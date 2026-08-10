"use client";

import { CustomerForm } from "@/features/customers/components/customer-form";
import { createCustomer } from "@/features/customers/actions";

export default function AddCustomerPage() {
  return <CustomerForm mode="create" onSubmit={createCustomer} />;
}
