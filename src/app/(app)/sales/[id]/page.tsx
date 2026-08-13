import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Mail, Phone, User, Receipt as ReceiptIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SALE_STATUS_VARIANT, INVOICE_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getSaleById } from "@/features/sales/queries";
import { SaleDetailActions } from "@/features/sales/components/sale-detail-actions";
import { GenerateInvoiceButton } from "@/features/sales/components/generate-invoice-button";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Bank Transfer",
  CARD: "Card",
  POS: "POS",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{sale.number}</h1>
              <StatusBadge label={STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(sale.date)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GenerateInvoiceButton saleId={sale.id} invoice={sale.invoice} />
            {sale.status === "COMPLETED" ? (
              <Button
                variant="outline"
                render={<Link href={`/sales/${sale.id}/receipt`} target="_blank" />}
                nativeButton={false}
              >
                <ReceiptIcon />
                Download Receipt
              </Button>
            ) : null}
            <SaleDetailActions id={sale.id} status={sale.status} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium text-foreground">{sale.customer.name}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" />
              {sale.customer.phone}
            </p>
            {sale.customer.email ? (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5" />
                {sale.customer.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Agent</p>
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="size-3.5" />
              {sale.agent?.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Warehouse</p>
            <p className="font-medium text-foreground">{sale.warehouse?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Payment Method</p>
            <p className="font-medium text-foreground">
              {sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : "—"}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatNaira(sale.subtotal)}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">{formatNaira(sale.tax)}</span>
            </p>
            <p className="flex items-center justify-between font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatNaira(sale.total)}</span>
            </p>
          </div>
        </div>

        {sale.notes ? (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-foreground">{sale.notes}</p>
          </div>
        ) : null}
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 pb-4">
              <h3 className="font-semibold text-foreground">Items</h3>
            </div>
            <div className="p-5 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.product.name}</TableCell>
                      <TableCell>{item.product.sku}</TableCell>
                      <TableCell>{formatNaira(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatNaira(item.discount)}</TableCell>
                      <TableCell>{formatNaira(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="mt-4">
          <Card className="p-0">
            <div className="p-5">
              {sale.invoice ? (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{sale.invoice.number}</span>
                    <StatusBadge
                      label={INVOICE_STATUS_LABELS[sale.invoice.status]}
                      variant={INVOICE_STATUS_VARIANT[sale.invoice.status]}
                    />
                  </div>
                  <Button variant="outline" size="sm" render={<Link href={`/invoices/${sale.invoice.id}`} />} nativeButton={false}>
                    View Invoice
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={ShoppingCart}
                  title="No invoice yet"
                  description="Generate an invoice from this sale using the button above."
                />
              )}
            </div>
          </Card>
        </TabsContent>

        {["payment"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0">
              <div className="p-5">
                <EmptyState
                  icon={ShoppingCart}
                  title={`No ${tab} yet`}
                  description="This section will be available once the related module is built."
                />
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
