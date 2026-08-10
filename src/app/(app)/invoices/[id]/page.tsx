import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Mail, Phone, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INVOICE_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getInvoiceById } from "@/features/invoices/queries";
import { InvoiceDetailActions } from "@/features/invoices/components/invoice-detail-actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function InvoiceDetailPage({
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
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{invoice.number}</h1>
              <StatusBadge label={STATUS_LABELS[invoice.status]} variant={INVOICE_STATUS_VARIANT[invoice.status]} />
            </div>
            <p className="text-sm text-muted-foreground">
              Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
            </p>
            {invoice.sale ? (
              <p className="text-sm text-muted-foreground">
                Generated from{" "}
                <Link href={`/sales/${invoice.sale.id}`} className="text-primary hover:underline">
                  {invoice.sale.number}
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" render={<Link href={`/invoices/${invoice.id}/document`} />} nativeButton={false}>
              <FileText />
              View Document
            </Button>
            <InvoiceDetailActions id={invoice.id} status={invoice.status} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium text-foreground">{invoice.customer.name}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" />
              {invoice.customer.phone}
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="size-3.5" />
              {invoice.customer.email}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-xs text-muted-foreground">Agent</p>
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="size-3.5" />
              {invoice.agent?.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Payment Term</p>
            <p className="font-medium text-foreground">{invoice.paymentTerm ?? "—"}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatNaira(invoice.subtotal)}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-foreground">{formatNaira(invoice.discount)}</span>
            </p>
            <p className="flex items-center justify-between font-medium">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatNaira(invoice.total)}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-success">{formatNaira(invoice.paidAmount)}</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">Due</span>
              <span className="text-destructive">{formatNaira(invoice.dueAmount)}</span>
            </p>
          </div>
        </div>

        {invoice.notes ? (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-foreground">{invoice.notes}</p>
          </div>
        ) : null}
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
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
                    <TableHead>Description</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.description}</TableCell>
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

        <TabsContent value="payments" className="mt-4">
          <Card className="p-0">
            <div className="p-5">
              {invoice.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium text-foreground">{payment.reference}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{formatNaira(payment.amount)}</TableCell>
                        <TableCell>{payment.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No payments yet"
                  description="Payments recorded against this invoice will appear here."
                />
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
