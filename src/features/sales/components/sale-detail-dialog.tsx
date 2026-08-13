"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/currency";
import { SALE_STATUS_VARIANT, INVOICE_STATUS_VARIANT } from "@/lib/constants";
import type { SaleListRow } from "@/features/sales/queries";

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

export function SaleDetailDialog({
  sale,
  open,
  onOpenChange,
}: {
  sale: SaleListRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Invoice</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{sale.number}</p>
              <StatusBadge label={STATUS_LABELS[sale.status]} variant={SALE_STATUS_VARIANT[sale.status]} />
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{formatDate(sale.date)}</p>
          </div>

          {sale.invoiceStatus ? (
            <div>
              <p className="text-xs text-muted-foreground">Invoice Status</p>
              <StatusBadge
                label={INVOICE_STATUS_LABELS[sale.invoiceStatus]}
                variant={INVOICE_STATUS_VARIANT[sale.invoiceStatus]}
              />
            </div>
          ) : null}

          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-medium text-foreground">{sale.customerName}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {sale.customerPhone}
              </p>
              {sale.customerEmail ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {sale.customerEmail}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agent</p>
              <p className="font-medium text-foreground">{sale.agentName ?? "—"}</p>
            </div>
            {sale.paymentMethod ? (
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                <p className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[sale.paymentMethod]}</p>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className="font-medium text-foreground">{formatNaira(sale.subtotal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tax</p>
              <p className="font-medium text-foreground">{formatNaira(sale.tax)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium text-foreground">{formatNaira(sale.total)}</p>
            </div>
          </div>

          {sale.notes ? (
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm text-foreground">{sale.notes}</p>
            </div>
          ) : null}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              render={<Link href={`/sales/${sale.id}`} />}
              nativeButton={false}
            >
              View Full Details
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              render={<Link href={`/sales/${sale.id}/edit`} />}
              nativeButton={false}
            >
              Edit Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
