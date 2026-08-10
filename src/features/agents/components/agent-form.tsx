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
import { agentSchema, type AgentFormInput, type AgentInput } from "@/features/agents/schema";

const TERRITORY_ITEMS = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Other"];
const AGENT_TYPE_ITEMS = { SALES: "Sales Agent", COLLECTION: "Collection Agent" };
const BANK_ITEMS = [
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Fidelity Bank",
  "Other",
];

export function AgentForm({
  mode,
  defaultValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  defaultValues?: Partial<AgentFormInput>;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string } | undefined>;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgentFormInput, unknown, AgentInput>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      agentType: "SALES",
      region: "",
      bankName: "",
      commissionRate: 0,
      ...defaultValues,
    },
  });

  const agentType = watch("agentType");
  const region = watch("region");
  const bankName = watch("bankName");
  const imageUrl = watch("imageUrl");

  async function submit(data: AgentInput) {
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
            {mode === "create" ? "Add New Agent" : "Edit Agent"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create" ? "Fill in the details below and add new agent" : "Update the agent's details below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Save Agent" : "Save Changes"}
          </Button>
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={(url) => setValue("imageUrl", url)}
        label="Agent"
        icon={User}
      />

      <Card className="gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Full Name" placeholder="Enter full name" error={errors.name?.message} {...register("name")} />

          <div className="grid gap-1.5">
            <Label>Territory</Label>
            <Select
              items={Object.fromEntries(TERRITORY_ITEMS.map((t) => [t, t]))}
              value={region}
              onValueChange={(value) => setValue("region", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Territory" />
              </SelectTrigger>
              <SelectContent>
                {TERRITORY_ITEMS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region ? <p className="text-xs text-destructive">{errors.region.message}</p> : null}
          </div>

          <TextInput
            label="Phone Number"
            placeholder="Enter Phone Number"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <div className="grid gap-1.5">
            <Label>Agent Type</Label>
            <Select
              items={AGENT_TYPE_ITEMS}
              value={agentType}
              onValueChange={(value) => setValue("agentType", value as AgentInput["agentType"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALES">Sales Agent</SelectItem>
                <SelectItem value="COLLECTION">Collection Agent</SelectItem>
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
          <TextInput label="ID number" placeholder="Enter ID" error={errors.idNumber?.message} {...register("idNumber")} />

          <TextInput
            label="Commission Rate (%)"
            type="number"
            placeholder="Enter Commission Rate"
            error={errors.commissionRate?.message}
            {...register("commissionRate")}
          />

          <div className="grid gap-1.5">
            <Label>Bank Name</Label>
            <Select
              items={Object.fromEntries(BANK_ITEMS.map((b) => [b, b]))}
              value={bankName}
              onValueChange={(value) => setValue("bankName", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                {BANK_ITEMS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TextInput
            label="Account Number"
            placeholder="Enter Account Number"
            error={errors.accountNumber?.message}
            {...register("accountNumber")}
          />
          <TextInput
            label="Account Name"
            placeholder="Enter Account Name"
            error={errors.accountName?.message}
            {...register("accountName")}
          />
        </div>
      </Card>
    </form>
  );
}
