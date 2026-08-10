import { SaleForm } from "@/features/sales/components/sale-form";
import { createSale } from "@/features/sales/actions";
import {
  getCustomerOptions,
  getAgentOptions,
  getWarehouseOptions,
  getProductPickerOptions,
} from "@/features/sales/queries";

export default async function AddSalePage() {
  const [customerOptions, agentOptions, warehouseOptions, productOptions] = await Promise.all([
    getCustomerOptions(),
    getAgentOptions(),
    getWarehouseOptions(),
    getProductPickerOptions(),
  ]);

  return (
    <SaleForm
      customerOptions={customerOptions}
      agentOptions={agentOptions}
      warehouseOptions={warehouseOptions}
      productOptions={productOptions}
      onSubmit={createSale}
    />
  );
}
