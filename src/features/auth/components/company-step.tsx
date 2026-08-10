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
import { companyInfoSchema, type CompanyInfoInput } from "@/features/auth/schema";

const INDUSTRIES = [
  "Information Technology",
  "Retail",
  "Manufacturing",
  "Healthcare",
  "Finance",
  "Logistics",
  "Other",
];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Other"];

export function CompanyStep({
  totalSteps,
  defaultValues,
  onContinue,
}: {
  totalSteps: number;
  defaultValues?: Partial<CompanyInfoInput>;
  onContinue: (data: CompanyInfoInput) => void;
}) {
  const [companyName, setCompanyName] = React.useState(defaultValues?.companyName ?? "");
  const [industry, setIndustry] = React.useState(defaultValues?.industry ?? "Information Technology");
  const [companySize, setCompanySize] = React.useState(defaultValues?.companySize ?? "");
  const [country, setCountry] = React.useState(defaultValues?.country ?? "");
  const [businessAddress, setBusinessAddress] = React.useState(defaultValues?.businessAddress ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = companyInfoSchema.safeParse({
      companyName,
      industry,
      companySize,
      country,
      businessAddress,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    onContinue(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <StepBadge step={2} total={totalSteps} label="Company data" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Complete your company data</h1>
        <p className="text-sm text-muted-foreground">
          Enter your company data for us to fill the company profile in dashboard
        </p>
      </div>

      <TextInput
        label="Company name"
        placeholder="Enter your company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        error={errors.companyName}
      />

      <div className="grid gap-1.5">
        <Label>Industry</Label>
        <Select value={industry} onValueChange={(value) => setIndustry(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>Company Size</Label>
        <Select value={companySize} onValueChange={(value) => setCompanySize(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.companySize ? <p className="text-xs text-destructive">{errors.companySize}</p> : null}
      </div>

      <div className="grid gap-1.5">
        <Label>Country</Label>
        <Select value={country} onValueChange={(value) => setCountry(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country ? <p className="text-xs text-destructive">{errors.country}</p> : null}
      </div>

      <TextInput
        label="Business Address"
        placeholder="Enter business address"
        value={businessAddress}
        onChange={(e) => setBusinessAddress(e.target.value)}
        error={errors.businessAddress}
      />

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
