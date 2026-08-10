"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, Pencil, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteInvoice, markInvoiceAsPaid, updateInvoiceStatus } from "@/features/invoices/actions";

const PAYMENT_METHOD_ITEMS = { CASH: "Cash", TRANSFER: "Bank Transfer", CARD: "Card", POS: "POS" };

export function InvoiceDetailActions({
  id,
  status,
}: {
  id: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [markPaidOpen, setMarkPaidOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [markPaidError, setMarkPaidError] = React.useState<string | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = React.useState(false);

  async function handleStatusChange(next: "DRAFT" | "SENT" | "PAID" | "OVERDUE") {
    const result = await updateInvoiceStatus(id, next);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Invoice status updated");
    router.refresh();
  }

  async function handleMarkAsPaid() {
    if (!paymentMethod) {
      setMarkPaidError("Select a payment method");
      return;
    }
    setMarkPaidError(null);
    setIsMarkingPaid(true);
    const result = await markInvoiceAsPaid(id, paymentMethod as "CASH" | "TRANSFER" | "CARD" | "POS", paymentDate);
    setIsMarkingPaid(false);

    if (!result.success) {
      setMarkPaidError(result.error);
      return;
    }
    setMarkPaidOpen(false);
    setPaymentMethod("");
    toast.success("Invoice marked as paid and payment recorded");
    router.refresh();
  }

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteInvoice(id);
    setIsPending(false);
    setConfirmOpen(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete invoice");
      return;
    }
    toast.success("Invoice deleted");
    router.push("/invoices");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Actions
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "DRAFT" ? (
            <DropdownMenuItem onClick={() => handleStatusChange("SENT")}>
              <Send />
              Mark as Sent
            </DropdownMenuItem>
          ) : null}
          {status !== "PAID" ? (
            <DropdownMenuItem onClick={() => setMarkPaidOpen(true)}>
              <CheckCircle2 />
              Mark as Paid
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button nativeButton={false} render={<Link href={`/invoices/${id}/edit`} />}>
        <Pencil />
        Edit
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark invoice as paid</DialogTitle>
            <DialogDescription>
              This records a payment for this invoice and marks it as paid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Payment Method</Label>
              <Select
                items={PAYMENT_METHOD_ITEMS}
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mark-paid-date">Payment Date</Label>
              <Input
                id="mark-paid-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            {markPaidError ? <p className="text-sm text-destructive">{markPaidError}</p> : null}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleMarkAsPaid} disabled={isMarkingPaid}>
              {isMarkingPaid ? "Saving..." : "Mark as Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
