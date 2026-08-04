"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { submitProviderResponse, type ProviderResponseResult } from "@/actions/provider-response";

const initialState: ProviderResponseResult = { ok: false };

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      isLoading={pending}
      size="lg"
      className="w-full"
      leftIcon={<Send className="h-4 w-4" />}
    >
      {children}
    </Button>
  );
}

interface ProviderResponseFormProps {
  incidentId: string;
  token: string;
  providerName: string;
}

export function ProviderResponseForm({
  incidentId,
  token,
  providerName,
}: ProviderResponseFormProps) {
  const [state, formAction] = useActionState(submitProviderResponse, initialState);
  const t = useTranslations("respond");

  useEffect(() => {
    if (state.ok) {
      toast.success(t("success_toast"));
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  if (state.ok) {
    return (
      <Card variant="elevated" className="border-success-500/30 bg-success-500/5">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="text-success-500 mx-auto h-16 w-16" />
          <h2 className="text-fg-primary mt-4 text-2xl font-bold">{t("success_title")}</h2>
          <p className="text-fg-muted mt-2 text-sm">{t("success_desc")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          className="border-danger-500/30 bg-danger-500/5 text-danger-400 rounded-md border p-3 text-sm"
          role="alert"
        >
          {t(`errors.${state.error}`, { defaultValue: state.error })}
        </div>
      )}

      {/* Hidden Fields */}
      <input type="hidden" name="incidentId" value={incidentId} />
      <input type="hidden" name="token" value={token} />

      <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
        <Building2 className="text-brand-400 h-6 w-6" />
        <div>
          <h2 className="text-fg-primary text-lg font-semibold">{providerName}</h2>
          <p className="text-fg-muted text-xs">{t("official_representation")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="responderName"
          label={t("name_label")}
          placeholder={t("name_placeholder")}
          required
          minLength={2}
          maxLength={100}
          error={state.fieldErrors?.responderName?.[0]}
        />
        <Input
          name="responderRole"
          label={t("role_label")}
          placeholder={t("role_placeholder")}
          maxLength={100}
          error={state.fieldErrors?.responderRole?.[0]}
        />
      </div>

      <Textarea
        name="responseText"
        label={t("response_label")}
        placeholder={t("response_placeholder")}
        required
        minLength={10}
        maxLength={10000}
        rows={8}
        error={state.fieldErrors?.responseText?.[0]}
      />

      <SubmitBtn>{t("submit_button")}</SubmitBtn>
    </form>
  );
}
