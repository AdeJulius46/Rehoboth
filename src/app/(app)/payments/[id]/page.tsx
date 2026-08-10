import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PAYMENT_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getPaymentById } from "@/features/payments/queries";
import { PaymentDetailActions } from "@/features/payments/components/payment-detail-actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Paid",
  FAILED: "Failed",
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Bank Transfer",
  CARD: "Card",
  POS: "POS",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function PaymentDetailPage({
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{payment.reference}</h1>
            <StatusBadge label={STATUS_LABELS[payment.status]} variant={PAYMENT_STATUS_VARIANT[payment.status]} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/payments/${payment.id}/receipt`} target="_blank" />}
            nativeButton={false}
          >
            <Download />
            Download Receipt
          </Button>
          <PaymentDetailActions id={payment.id} />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground">Overview</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-3 p-5">
          <h3 className="font-semibold text-foreground">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{payment.customer?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{payment.customer?.phone ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{payment.customer?.email ?? "—"}</span>
            </div>
          </div>
        </Card>

        <Card className="gap-3 p-5">
          <h3 className="font-semibold text-foreground">Invoice Information</h3>
          {payment.invoice ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice No</span>
                <span className="font-medium text-foreground">{payment.invoice.number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice Date</span>
                <span className="font-medium text-foreground">{formatDate(payment.invoice.issueDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium text-foreground">{formatDate(payment.invoice.dueDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice Amount</span>
                <span className="font-medium text-foreground">{formatNaira(payment.invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance Before Payment</span>
                <span className="font-medium text-foreground">
                  {payment.balanceBeforePayment !== null ? formatNaira(payment.balanceBeforePayment) : "—"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No invoice linked to this payment.</p>
          )}
        </Card>

        <Card className="gap-3 p-5">
          <h3 className="font-semibold text-foreground">Payment Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-foreground">{formatNaira(payment.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium text-foreground">{METHOD_LABELS[payment.method]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transaction Reference</span>
              <span className="font-medium text-foreground">{payment.reference}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Date</span>
              <span className="font-medium text-foreground">{formatDate(payment.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge label={STATUS_LABELS[payment.status]} variant={PAYMENT_STATUS_VARIANT[payment.status]} />
            </div>
          </div>
        </Card>
      </div>

      {payment.notes ? (
        <Card className="gap-2 p-5">
          <h3 className="font-semibold text-foreground">Notes</h3>
          <p className="text-sm text-foreground">{payment.notes}</p>
        </Card>
      ) : null}
    </div>
  );
}
