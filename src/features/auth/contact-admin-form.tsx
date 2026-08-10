"use client";

import * as React from "react";
import Link from "next/link";
import { Info, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactAdminRequest } from "@/features/auth/actions";

const SUBJECTS = ["Account Access", "Billing", "Bug Report", "Feature Request", "Other"];

export function ContactAdminForm() {
  const [isPending, startTransition] = React.useTransition();
  const [subject, setSubject] = React.useState("");
  const [state, setState] = React.useState<{ error?: string; success?: boolean }>({});

  function handleSubmit(formData: FormData) {
    formData.set("subject", subject);
    startTransition(async () => {
      const result = await submitContactAdminRequest(formData);
      setState(result.success ? { success: true } : { error: result.error });
    });
  }

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Message sent</h1>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out — the administrator will get back to you shortly.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Contact Administrator</h1>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and the administrator will get back to you
        </p>
      </div>

      <TextInput label="Your Name" name="name" placeholder="Enter your full name" required />
      <TextInput label="Email" name="email" type="email" placeholder="Enter your email" required />

      <div className="grid gap-1.5">
        <Label>Subject</Label>
        <Select value={subject} onValueChange={(value) => setSubject(value ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Type your message here..." required />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send Message"}
      </Button>

      <div className="space-y-3 rounded-lg bg-muted p-4 text-sm">
        <div className="flex gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-foreground" />
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">Other Options</p>
            <p className="text-muted-foreground">
              You can also reach the administrator directly via phone or email.
            </p>
          </div>
        </div>
        <a href="tel:+2348001234567" className="flex items-center gap-2 text-primary">
          <Phone className="size-4" />
          +234 800 123 4567
        </a>
        <a href="mailto:support@rehobothsoftware.com" className="flex items-center gap-2 text-primary">
          <Mail className="size-4" />
          support@rehobothsoftware.com
        </a>
      </div>
    </form>
  );
}
