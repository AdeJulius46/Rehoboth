"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { WarehouseIcon } from "lucide-react";

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
import { warehouseSchema, type WarehouseFormInput, type WarehouseInput } from "@/features/warehouses/schema";

const STATUS_ITEMS = { ACTIVE: "Active", INACTIVE: "Inactive" };

export function WarehouseForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<WarehouseFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormInput, unknown, WarehouseInput>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { status: "ACTIVE", ...defaultValues },
  });

  const status = watch("status");
  const imageUrl = watch("imageUrl");

  async function submit(data: WarehouseInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value));
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
            {mode === "create" ? "Add New Warehouse" : "Edit Warehouse"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and add new warehouse" : "Update the warehouse's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save Warehouse" : "Save Changes"}
          </Button>
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={(url) => setValue("imageUrl", url)}
        label="Warehouse"
        icon={WarehouseIcon}
      />

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Warehouse Name"
            placeholder="Enter warehouse name"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextInput
            label="Warehouse Code"
            placeholder="Auto generated if left blank"
            error={errors.code?.message}
            {...register("code")}
          />
          <div className="sm:col-span-2">
            <TextInput
              label="Location"
              placeholder="Enter full address"
              error={errors.location?.message}
              {...register("location")}
            />
          </div>
          <TextInput label="Manager" placeholder="Select manager" error={errors.manager?.message} {...register("manager")} />
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setValue("status", value as WarehouseInput["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TextInput
            label="Phone Number"
            placeholder="Enter phone number"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="Enter email address"
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="sm:col-span-2 grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Enter notes (optional)" {...register("notes")} />
          </div>
        </div>
      </Card>
    </form>
  );
}
