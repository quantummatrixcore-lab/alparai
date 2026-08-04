"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitInvestor, type InvestorState } from "@/actions/investor";

const initialState: InvestorState = { ok: false };

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      isLoading={pending}
      size="lg"
      className="text-bg-primary w-full bg-emerald-500 font-bold hover:bg-emerald-600"
      leftIcon={<Send className="h-4 w-4" />}
    >
      {children}
    </Button>
  );
}

export function InvestorForm() {
  const [state, formAction] = useActionState(submitInvestor, initialState);
  const t = useTranslations("invest");

  useEffect(() => {
    if (state.ok) {
      toast.success(t("success_title"));
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  if (state.ok) {
    return (
      <Card variant="elevated" className="border border-emerald-500/20 bg-[#0F1E2E]">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h3 className="text-fg-primary mt-6 text-2xl font-bold">{t("success_title")}</h3>
          <p className="text-fg-muted mx-auto mt-4 max-w-md text-sm">
            {t("success_body", { name: state.fullName || "", email: state.email || "" })}
          </p>
          <div className="mt-8">
            <a
              href="https://alparai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {t("success_cta")}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.formError && (
        <div
          className="border-danger-500/30 bg-danger-500/5 text-danger-400 rounded-md border p-3 text-sm"
          role="alert"
        >
          {state.formError}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="fullName"
          label={t("form_name")}
          placeholder={t("form_name_placeholder")}
          required
          minLength={2}
          maxLength={100}
          error={state.fieldErrors?.fullName?.[0]}
        />
        <Input
          name="email"
          type="email"
          label={t("form_email")}
          placeholder={t("form_email_placeholder")}
          required
          error={state.fieldErrors?.email?.[0]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="title"
          label={t("form_role")}
          placeholder={t("form_role_placeholder")}
          required
          minLength={2}
          maxLength={150}
          error={state.fieldErrors?.title?.[0]}
        />
        <Input
          name="company"
          label={t("form_company")}
          placeholder={t("form_company_placeholder")}
          required
          minLength={2}
          maxLength={150}
          error={state.fieldErrors?.company?.[0]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="linkedinUrl"
          label={t("form_linkedin")}
          placeholder={t("form_linkedin_placeholder")}
          required
          type="url"
          error={state.fieldErrors?.linkedinUrl?.[0]}
        />
        <Select
          name="checkSize"
          label={t("form_check_size")}
          required
          placeholder={t("form_check_size_placeholder")}
          error={state.fieldErrors?.checkSize?.[0]}
          options={[
            { value: "Pre-seed ($10K-$100K)", label: "Pre-seed ($10K-$100K)" },
            { value: "Seed ($100K-$500K)", label: "Seed ($100K-$500K)" },
            { value: "Series A ($500K-$2M)", label: "Series A ($500K-$2M)" },
            { value: "Series A+ ($2M+)", label: "Series A+ ($2M+)" },
            { value: "Strategic/Corporate", label: "Strategic/Corporate" },
            { value: "Other", label: "Other" },
          ]}
        />
      </div>
      <Textarea
        name="whyInterested"
        label={t("form_why")}
        placeholder={t("form_why_placeholder")}
        maxLength={500}
        rows={3}
        error={state.fieldErrors?.whyInterested?.[0]}
      />
      <div className="pt-2">
        <SubmitBtn>{t("form_submit")}</SubmitBtn>
      </div>
      <p className="text-fg-muted mt-2 text-center text-xs">{t("form_footer")}</p>
    </form>
  );
}
