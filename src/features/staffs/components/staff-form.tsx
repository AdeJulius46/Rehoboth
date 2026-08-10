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
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffSchema, type StaffFormInput, type StaffInput } from "@/features/staffs/schema";

const POSITION_ITEMS = ["Managing Director", "Manager", "Supervisor", "Officer", "Executive", "Intern"];
const DEPARTMENT_ITEMS = ["Sales", "Operations", "Finance", "Warehouse", "IT", "Management", "HR", "Other"];
const SYSTEM_ROLE_ITEMS = { "Super Admin": "Super Admin", Admin: "Admin", Manager: "Manager", Staff: "Staff" };

export function StaffForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<StaffFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormInput, unknown, StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: { position: "", department: "", systemRole: "", salary: 0, ...defaultValues },
  });

  const position = watch("position");
  const department = watch("department");
  const systemRole = watch("systemRole");
  const imageUrl = watch("imageUrl");

  async function submit(data: StaffInput) {
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
            {mode === "create" ? "Add New Staff" : "Edit Staff"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and add new staff" : "Update the staff member's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save Staff" : "Save Changes"}
          </Button>
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={(url) => setValue("imageUrl", url)}
        label="Staff"
        icon={User}
      />

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Full Name" placeholder="Enter full name" error={errors.name?.message} {...register("name")} />

          <div className="grid gap-1.5">
            <Label>Position</Label>
            <Select
              items={Object.fromEntries(POSITION_ITEMS.map((p) => [p, p]))}
              value={position}
              onValueChange={(value) => setValue("position", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_ITEMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position ? <p className="text-xs text-destructive">{errors.position.message}</p> : null}
          </div>

          <TextInput
            label="Phone Number"
            placeholder="Enter Phone Number"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="grid gap-1.5">
            <Label>Department</Label>
            <Select
              items={Object.fromEntries(DEPARTMENT_ITEMS.map((d) => [d, d]))}
              value={department}
              onValueChange={(value) => setValue("department", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_ITEMS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department ? <p className="text-xs text-destructive">{errors.department.message}</p> : null}
          </div>

          <TextInput
            label="Email Address"
            type="email"
            placeholder="Enter Email Address"
            error={errors.email?.message}
            {...register("email")}
          />

          <TextInput label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />

          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select
              items={SYSTEM_ROLE_ITEMS}
              value={systemRole}
              onValueChange={(value) => setValue("systemRole", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SYSTEM_ROLE_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TextInput
            label="Salary (₦)"
            type="number"
            placeholder="Enter Salary"
            error={errors.salary?.message}
            {...register("salary")}
          />

          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Address"
              placeholder="Enter full address"
              error={errors.address?.message}
              {...register("address")}
            />
            <TextInput
              label="Emergency Contact Name"
              placeholder="Enter contact name"
              error={errors.emergencyContactName?.message}
              {...register("emergencyContactName")}
            />
            <TextInput
              label="Emergency Contact Phone"
              placeholder="Enter contact phone"
              error={errors.emergencyContactPhone?.message}
              {...register("emergencyContactPhone")}
            />
          </div>
        </div>
      </Card>
    </form>
  );
}
