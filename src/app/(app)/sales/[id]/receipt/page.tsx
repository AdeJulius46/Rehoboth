import { notFound } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { PrintableDocument } from "@/components/printable-document";
import { formatNaira } from "@/lib/currency";
import { getSaleById } from "@/features/sales/queries";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SaleReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  const customer = sale.customer;

  return (
    <PrintableDocument fileName={sale.number}>
      <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 text-gray-900 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Logo size={64} />
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 sm:text-3xl">SALES RECEIPT</h1>
          <div className="text-right text-sm text-gray-500">
            <p>+234 703983687</p>
            <p>rehobothnig@hotmail.com</p>
            <p>Nigeria</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <p className="font-medium text-gray-900">Receipt ID : {sale.number}</p>
          <p className="font-medium text-gray-900">Date : {formatDate(sale.date)}</p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6 text-sm">
          <p className="font-medium text-gray-900">Name : {customer.name.toUpperCase()}</p>
          <p className="max-w-xs text-right font-medium text-gray-900">
            Customer&apos;s Address : {customer.address ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <p className="font-medium text-gray-900">Business Name : {customer.companyName ?? customer.name}</p>
          <p className="font-medium text-gray-900">Business Contact : {customer.phone}</p>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-900">Order Description :</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-2">Description</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="p-2">{item.product.name}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">{formatNaira(item.unitPrice)}</td>
                    <td className="p-2 text-right">{formatNaira(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto mt-4 w-64 space-y-1 text-sm">
            <div className="flex items-center justify-between border-t border-gray-200 pt-1 font-semibold">
              <span className="text-gray-900">Amount Paid</span>
              <span className="text-gray-900">{formatNaira(sale.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <p className="font-medium text-gray-900">Recipient Name : {customer.name.toUpperCase()}</p>
          <p className="max-w-xs text-right font-medium text-gray-900">
            Receipt&apos;s Address : {customer.address ?? "—"}
          </p>
        </div>
        <p className="text-right text-sm font-medium text-gray-900">Payment Date : {formatDate(sale.date)}</p>

        <div>
          <p className="mb-1 font-medium text-gray-900">Comment Box</p>
          <div className="min-h-16 rounded-md border border-gray-200 p-2 text-sm text-gray-500">
            {sale.notes ?? ""}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-sm">
          <div className="border-t border-gray-200 pt-2 text-gray-900">Client&apos;s Signature</div>
          <div className="border-t border-gray-200 pt-2 text-gray-900">REHOBOTH Agent Signature</div>
        </div>

        <p className="text-sm italic text-gray-500">Thank you for choosing REHOBOTH!</p>
      </div>
    </PrintableDocument>
  );
}
