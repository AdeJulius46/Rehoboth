"use client";

import * as React from "react";
import { toast } from "sonner";

import { CreateAccountStep } from "@/features/auth/components/create-account-step";
import { OtpStep } from "@/features/auth/components/otp-step";
import { PersonalStep } from "@/features/auth/components/personal-step";
import { CompanyStep } from "@/features/auth/components/company-step";
import { PreferencesStep } from "@/features/auth/components/preferences-step";
import { CompleteStep } from "@/features/auth/components/complete-step";
import { checkCompanyExists, completeRegistration } from "@/features/auth/register-actions";
import type {
  CompanyInfoInput,
  CreateAccountInput,
  PersonalInfoInput,
  PreferencesInput,
} from "@/features/auth/schema";

type Step = "create" | "otp" | "personal" | "company" | "preferences" | "complete";

export function RegisterWizard() {
  const [step, setStep] = React.useState<Step>("create");
  const [account, setAccount] = React.useState<CreateAccountInput>();
  const [needsCompanyStep, setNeedsCompanyStep] = React.useState(false);
  const [personal, setPersonal] = React.useState<PersonalInfoInput>();
  const [company, setCompany] = React.useState<CompanyInfoInput>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleAccountContinue(data: CreateAccountInput) {
    setAccount(data);
    setStep("otp");
  }

  async function handleVerified() {
    const companyExists = await checkCompanyExists();
    setNeedsCompanyStep(!companyExists);
    setStep("personal");
  }

  function handlePersonalContinue(data: PersonalInfoInput) {
    setPersonal(data);
    setStep(needsCompanyStep ? "company" : "preferences");
  }

  function handleCompanyContinue(data: CompanyInfoInput) {
    setCompany(data);
    setStep("preferences");
  }

  async function handlePreferencesContinue(data: PreferencesInput) {
    if (!account || !personal) return;
    setIsSubmitting(true);
    const result = await completeRegistration({
      email: account.email,
      password: account.password,
      personal,
      company,
      preferences: data,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setStep("complete");
  }

  switch (step) {
    case "create":
      return <CreateAccountStep onContinue={handleAccountContinue} />;
    case "otp":
      if (!account) return null;
      return (
        <OtpStep
          email={account.email}
          onVerified={() => {
            void handleVerified();
          }}
          onChangeEmail={() => setStep("create")}
        />
      );
    case "personal":
      return (
        <PersonalStep
          totalSteps={needsCompanyStep ? 3 : 2}
          defaultValues={{ fullName: account?.fullName, ...personal }}
          onContinue={handlePersonalContinue}
        />
      );
    case "company":
      return (
        <CompanyStep totalSteps={3} defaultValues={company} onContinue={handleCompanyContinue} />
      );
    case "preferences":
      return (
        <PreferencesStep
          totalSteps={needsCompanyStep ? 3 : 2}
          isSubmitting={isSubmitting}
          onContinue={(data) => {
            void handlePreferencesContinue(data);
          }}
        />
      );
    case "complete":
      return <CompleteStep />;
    default:
      return null;
  }
}
