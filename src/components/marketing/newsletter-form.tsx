"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter, type NewsletterState } from "@/actions/newsletter";

const initialState: NewsletterState = { ok: false };

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      isLoading={pending}
      size="lg"
      className="w-full shrink-0 sm:w-auto"
      leftIcon={<Mail className="h-4 w-4" />}
    >
      {children}
    </Button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeNewsletter, initialState);
  const t = useTranslations("newsletter");
  const locale = useLocale();

  useEffect(() => {
    if (state.ok) {
      toast.success(t("success_toast", { defaultValue: "Subscribed successfully!" }));
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  if (state.ok) {
    return (
      <Card variant="elevated" className="border-success-500/20 bg-success-500/5">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="text-success-500 mx-auto h-10 w-10" />
          <h3 className="text-fg-primary mt-3 text-lg font-bold">{t("success")}</h3>
          <p className="text-fg-muted mt-1 text-sm">{t("privacy")}</p>
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
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            name="email"
            type="email"
            placeholder={t("placeholder")}
            required
            error={state.fieldErrors?.email?.[0]}
            className="h-12"
          />
        </div>
        <SubmitBtn>{t("submit")}</SubmitBtn>
      </div>
      <p className="text-fg-muted text-[11px] font-medium tracking-wide">{t("privacy")}</p>
    </form>
  );
}
