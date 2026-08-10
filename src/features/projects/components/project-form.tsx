"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectSchema, type ProjectFormInput, type ProjectInput } from "@/features/projects/schema";

const STATUS_ITEMS = { ACTIVE: "In Progress", ON_HOLD: "On Hold", COMPLETED: "Completed", CANCELLED: "Cancelled" };

export function ProjectForm({
  mode,
  defaultValues,
  customerOptions,
  agentOptions,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<ProjectFormInput>;
  customerOptions: ComboboxOption[];
  agentOptions: ComboboxOption[];
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: "ACTIVE", budget: 0, progress: 0, customerId: "", agentId: "", ...defaultValues },
  });

  const customerId = watch("customerId");
  const agentId = watch("agentId");
  const status = watch("status");

  async function submit(data: ProjectInput) {
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
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and create new project" : "Update the project's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create new" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Project Name"
            placeholder="Enter project name"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid gap-1.5">
            <Label>Customer</Label>
            <Combobox
              options={customerOptions}
              value={customerId}
              onValueChange={(value) => setValue("customerId", value)}
              placeholder="Select Customer"
              searchPlaceholder="Search customers..."
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Agent</Label>
            <Combobox
              options={agentOptions}
              value={agentId}
              onValueChange={(value) => setValue("agentId", value)}
              placeholder="Select Agent"
              searchPlaceholder="Search agents..."
            />
          </div>

          <TextInput
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <TextInput label="Due Date" type="date" error={errors.endDate?.message} {...register("endDate")} />

          <TextInput
            label="Project Value (₦)"
            type="number"
            placeholder="Enter project value"
            error={errors.budget?.message}
            {...register("budget")}
          />

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description (optional)"
              {...register("description")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setValue("status", value as ProjectInput["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
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

          {mode === "edit" ? (
            <TextInput
              label="Progress (%)"
              type="number"
              min={0}
              max={100}
              error={errors.progress?.message}
              {...register("progress")}
            />
          ) : null}
        </div>
      </Card>
    </form>
  );
}
