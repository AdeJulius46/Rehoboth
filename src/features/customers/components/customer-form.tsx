"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  customerSchema,
  type CustomerFormInput,
  type CustomerInput,
} from "@/features/customers/schema";

const CUSTOMER_TYPE_ITEMS = { INDIVIDUAL: "Individual", BUSINESS: "Company" };

export function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<CustomerFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput, unknown, CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: "INDIVIDUAL",
      openingBalance: 0,
      ...defaultValues,
    },
  });

  const type = watch("type");
  const imageUrl = watch("imageUrl");

  async function submit(data: CustomerInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, String(value));
      }
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
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Add New Customer" : "Edit Customer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Fill in the details below and add new customer"
              : "Update the customer's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save Customer" : "Save Changes"}
          </Button>
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={(url) => setValue("imageUrl", url)}
        label="Customer"
        icon={User}
      />

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Customer Name"
            placeholder="Enter customer name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextInput
            label="Company Name"
            placeholder="Enter Company Name"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <TextInput
            label="Phone Number"
            placeholder="Enter Phone Number"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <div className="grid gap-1.5">
            <Label>Customer Type</Label>
            <Select
              items={CUSTOMER_TYPE_ITEMS}
              value={type}
              onValueChange={(value) => setValue("type", value as CustomerInput["type"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="BUSINESS">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TextInput
            label="Email Address"
            type="email"
            placeholder="Enter Email Address"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextInput
            label="Tax ID / BVN (Optional)"
            placeholder="Enter ID or BVN"
            error={errors.taxId?.message}
            {...register("taxId")}
          />
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter full address" {...register("address")} />
          </div>
          <TextInput
            label="Credit Limit (₦)"
            type="number"
            placeholder="Enter Credit Limit"
            error={errors.creditLimit?.message}
            {...register("creditLimit")}
          />
          <TextInput
            label="Opening Balance (₦)"
            type="number"
            placeholder="Enter Opening Balance"
            error={errors.openingBalance?.message}
            {...register("openingBalance")}
          />
        </div>
      </Card>
    </form>
  );
}
