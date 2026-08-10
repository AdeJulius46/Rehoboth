"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepBadge } from "@/features/auth/components/step-badge";
import { personalInfoSchema, type PersonalInfoInput } from "@/features/auth/schema";

const DEPARTMENTS = ["Sales", "Operations", "Finance", "Warehouse", "IT", "Management", "Other"];

export function PersonalStep({
  totalSteps,
  defaultValues,
  onContinue,
}: {
  totalSteps: number;
  defaultValues?: Partial<PersonalInfoInput>;
  onContinue: (data: PersonalInfoInput) => void;
}) {
  const [fullName, setFullName] = React.useState(defaultValues?.fullName ?? "");
  const [phone, setPhone] = React.useState(defaultValues?.phone ?? "");
  const [jobTitle, setJobTitle] = React.useState(defaultValues?.jobTitle ?? "");
  const [department, setDepartment] = React.useState(defaultValues?.department ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = personalInfoSchema.safeParse({ fullName, phone, jobTitle, department });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    onContinue(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StepBadge step={1} total={totalSteps} label="Personal data" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Complete your details</h1>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <TextInput
        label="Full Name"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />
      <TextInput
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
      <TextInput
        label="Job Title"
        placeholder="Enter your job title"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        error={errors.jobTitle}
      />

      <div className="grid gap-1.5">
        <Label>Department</Label>
        <Select value={department} onValueChange={(value) => setDepartment(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department ? <p className="text-xs text-destructive">{errors.department}</p> : null}
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
