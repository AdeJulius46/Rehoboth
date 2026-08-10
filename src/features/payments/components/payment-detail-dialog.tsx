"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/currency";
import { PAYMENT_STATUS_VARIANT } from "@/lib/constants";
import type { PaymentListRow } from "@/features/payments/queries";

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

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: PaymentListRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Payment ID</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{payment.reference}</p>
              <StatusBadge label={STATUS_LABELS[payment.status]} variant={PAYMENT_STATUS_VARIANT[payment.status]} />
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{formatDate(payment.date)}</p>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-medium text-foreground">{payment.customerName}</p>
              {payment.customerPhone ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {payment.customerPhone}
                </p>
              ) : null}
              {payment.customerEmail ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {payment.customerEmail}
                </p>
              ) : null}
            </div>
            {payment.invoiceNumber ? (
              <div>
                <p className="text-xs text-muted-foreground">Invoice</p>
                <p className="font-medium text-foreground">
                  {payment.invoiceNumber} {payment.invoiceTotal !== null ? `(${formatNaira(payment.invoiceTotal)})` : ""}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="font-medium text-foreground">{formatNaira(payment.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="font-medium text-foreground">{METHOD_LABELS[payment.method]}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              render={<Link href={`/payments/${payment.id}`} />}
              nativeButton={false}
            >
              View Full Details
            </Button>
            {payment.invoiceId ? (
              <Button
                variant="outline"
                className="flex-1"
                render={<Link href={`/invoices/${payment.invoiceId}`} />}
                nativeButton={false}
              >
                View Invoice
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="flex-1"
              render={<Link href={`/payments/${payment.id}/receipt`} target="_blank" />}
              nativeButton={false}
            >
              Download Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
