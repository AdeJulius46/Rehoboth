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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira } from "@/lib/currency";
import {
  invoiceUpdateSchema,
  type InvoiceUpdateFormInput,
  type InvoiceUpdateInput,
} from "@/features/invoices/schema";

const STATUS_ITEMS = { DRAFT: "Draft", SENT: "Sent", PAID: "Paid", OVERDUE: "Overdue" };
const PAYMENT_TERM_ITEMS = {
  "Due on Receipt": "Due on Receipt",
  "Net 15": "Net 15",
  "Net 30": "Net 30",
  "Net 60": "Net 60",
};

export function InvoiceEditForm({
  number,
  customerName,
  items,
  total,
  agentOptions,
  defaultValues,
  onSubmit,
}: {
  number: string;
  customerName: string;
  items: { description: string; quantity: number; unitPrice: number; discount: number; lineTotal: number }[];
  total: number;
  agentOptions: ComboboxOption[];
  defaultValues: Partial<InvoiceUpdateFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceUpdateFormInput, unknown, InvoiceUpdateInput>({
    resolver: zodResolver(invoiceUpdateSchema),
    defaultValues: { status: "DRAFT", agentId: "", paymentTerm: undefined, ...defaultValues },
  });

  const agentId = watch("agentId");
  const status = watch("status");
  const paymentTerm = watch("paymentTerm");

  async function submit(data: InvoiceUpdateInput) {
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
          <h1 className="text-xl font-semibold text-foreground">Edit Invoice</h1>
          <p className="text-sm text-muted-foreground">{number}</p>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <p className="flex h-8 items-center text-sm text-muted-foreground">{customerName}</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Agent</Label>
            <Combobox
              options={agentOptions}
              value={agentId}
              onValueChange={(value) => setValue("agentId", value)}
              placeholder="Select agent"
              searchPlaceholder="Search agents..."
            />
          </div>
          <TextInput label="Due Date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
          <div className="grid gap-1.5">
            <Label>Payment Term</Label>
            <Select
              items={PAYMENT_TERM_ITEMS}
              value={paymentTerm}
              onValueChange={(value) => setValue("paymentTerm", value ?? undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment term" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_TERM_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setValue("status", value as InvoiceUpdateInput["status"])}
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
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                <TableCell>{formatNaira(item.unitPrice)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatNaira(item.discount)}</TableCell>
                <TableCell>{formatNaira(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Description</Label>
          <Textarea id="notes" placeholder="Enter notes (optional)" {...register("notes")} />
        </div>

        <p className="text-sm text-muted-foreground">
          Total Amount: <span className="font-medium text-foreground">{formatNaira(total)}</span>
        </p>
      </Card>
    </form>
  );
}
