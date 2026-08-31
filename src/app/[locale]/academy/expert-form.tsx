"use client";

import { useTranslations } from "next-intl";
import { submitExpert } from "@/actions/experts";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

export function ExpertForm() {
  const t = useTranslations("academy");
  const [isSuccess, setIsSuccess] = useState(false);

  const [state, action, isPending] = useActionState(submitExpert, {
    ok: false,
    error: undefined,
  });

  useEffect(() => {
    if (state.ok) {
      setIsSuccess(true);
    }
  }, [state]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="bg-brand-500/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 className="text-brand-400 h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold">{t("form_success_title")}</h3>
        <p className="text-fg-muted">{t("form_success_body")}</p>
        <Button variant="outline" className="mt-4" onClick={() => setIsSuccess(false)}>
          {t("form_submit_another")}
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {state.formError && (
        <div className="bg-danger-500/10 border-danger-500/50 text-danger-500 flex gap-3 rounded-lg border p-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{state.formError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("form_fullname")}
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder={t("form_fullname_placeholder")}
            className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {state.fieldErrors?.name && (
            <p className="text-danger-500 text-sm">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("form_email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("form_email_placeholder")}
            className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {state.fieldErrors?.email && (
            <p className="text-danger-500 text-sm">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("form_title")}
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder={t("form_title_placeholder")}
            className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {state.fieldErrors?.title && (
            <p className="text-danger-500 text-sm">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="institution"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("form_institution")}
          </label>
          <input
            id="institution"
            name="institution"
            required
            placeholder={t("form_institution_placeholder")}
            className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {state.fieldErrors?.institution && (
            <p className="text-danger-500 text-sm">{state.fieldErrors.institution[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="expertiseArea"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("form_expertise")}
        </label>
        <select
          id="expertiseArea"
          name="expertiseArea"
          required
          defaultValue=""
          className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            {t("form_expertise_placeholder")}
          </option>
          <option value="legal">{t("expertise_legal")}</option>
          <option value="medical">{t("expertise_medical")}</option>
          <option value="cybersecurity">{t("expertise_cybersecurity")}</option>
          <option value="research">{t("expertise_research")}</option>
          <option value="ethics">{t("expertise_ethics")}</option>
          <option value="policy">{t("expertise_policy")}</option>
          <option value="other">{t("expertise_other")}</option>
        </select>
        {state.fieldErrors?.expertiseArea && (
          <p className="text-danger-500 text-sm">{state.fieldErrors.expertiseArea[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="linkedinUrl"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t("form_linkedin")}
        </label>
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          placeholder={t("form_linkedin_placeholder")}
          className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {state.fieldErrors?.linkedinUrl && (
          <p className="text-danger-500 text-sm">{state.fieldErrors.linkedinUrl[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        className="bg-brand-500 hover:bg-brand-400 h-12 w-full text-lg text-white"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {t("apply_btn")}
      </Button>
    </form>
  );
}
