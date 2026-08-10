import { notFound } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { PrintableDocument } from "@/components/printable-document";
import { formatNaira } from "@/lib/currency";
import { getInvoiceById } from "@/features/invoices/queries";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function InvoiceDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <PrintableDocument fileName={invoice.number}>
      <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 text-gray-900 sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Logo size={64} />
          <h1 className="text-3xl font-bold tracking-wide text-gray-900">INVOICE</h1>
          <div className="text-right text-sm text-gray-500">
            <p>+234 703983687</p>
            <p>rehobothnig@hotmail.com</p>
            <p>Nigeria</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <p className="font-medium text-gray-900">Invoice ID : {invoice.number}</p>
          <div className="text-right">
            <p className="font-medium text-gray-900">Invoice Date : {formatDate(invoice.issueDate)}</p>
            <p className="font-medium text-gray-900">Due Date : {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-6 text-sm">
          <p className="font-medium text-gray-900">Name : {invoice.customer.name.toUpperCase()}</p>
          <p className="max-w-xs text-right font-medium text-gray-900">
            Customer&apos;s Address : {invoice.customer.address ?? "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 text-sm">
          <p className="font-medium text-gray-900">
            Business Name : {invoice.customer.companyName ?? invoice.customer.name}
          </p>
          <p className="font-medium text-gray-900">Business Contact : {invoice.customer.phone}</p>
        </div>

        <div>
          <p className="mb-2 font-medium text-gray-900">Order Description :</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-2 w-10">#</th>
                  <th className="p-2">Item</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">{formatNaira(item.unitPrice)}</td>
                    <td className="p-2 text-right">{formatNaira(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto mt-4 w-64 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatNaira(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="text-gray-900">{formatNaira(invoice.discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-1 font-semibold">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-gray-900">{formatNaira(invoice.total)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm italic text-gray-500">Thank you for choosing REHOBOTH!</p>
      </div>
    </PrintableDocument>
  );
}
