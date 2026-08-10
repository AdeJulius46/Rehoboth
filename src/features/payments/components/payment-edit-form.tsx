"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  paymentUpdateSchema,
  type PaymentUpdateFormInput,
  type PaymentUpdateInput,
} from "@/features/payments/schema";

const METHOD_ITEMS = { CASH: "Cash", TRANSFER: "Bank Transfer", CARD: "Card", POS: "POS" };
const STATUS_ITEMS = { PENDING: "Pending", COMPLETED: "Paid", FAILED: "Failed" };

export function PaymentEditForm({
  reference,
  customerName,
  invoiceNumber,
  defaultValues,
  onSubmit,
}: {
  reference: string;
  customerName: string;
  invoiceNumber: string | null;
  defaultValues: Partial<PaymentUpdateFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentUpdateFormInput, unknown, PaymentUpdateInput>({
    resolver: zodResolver(paymentUpdateSchema),
    defaultValues: { status: "PENDING", method: "CASH", ...defaultValues },
  });

  const method = watch("method");
  const status = watch("status");

  async function submit(data: PaymentUpdateInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") formData.set(key, String(value));
    });

    const result = await onSubmit(formData);
    if (result && !result.success) {
      toast.error(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Edit Payment</h1>
          <p className="text-sm text-muted-foreground">{reference}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <p className="flex h-8 items-center text-sm text-muted-foreground">{customerName}</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Invoice</Label>
            <p className="flex h-8 items-center text-sm text-muted-foreground">{invoiceNumber ?? "—"}</p>
          </div>
          <TextInput
            label="Payment Amount"
            type="number"
            error={errors.amount?.message}
            {...register("amount")}
          />
          <div className="grid gap-1.5">
            <Label>Payment Method</Label>
            <Select
              items={METHOD_ITEMS}
              value={method}
              onValueChange={(value) => setValue("method", value as PaymentUpdateInput["method"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METHOD_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TextInput label="Payment Date" type="date" error={errors.date?.message} {...register("date")} />
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setValue("status", value as PaymentUpdateInput["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Enter notes (optional)" {...register("notes")} />
        </div>
      </Card>
    </form>
  );
}
