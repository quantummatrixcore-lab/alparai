"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitExpert, type ExpertState } from "@/actions/experts";

const initialState: ExpertState = { ok: false };

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      isLoading={pending}
      size="lg"
      className="bg-success-500 hover:bg-success-600 w-full text-white"
      leftIcon={<Send className="h-4 w-4" />}
    >
      {children}
    </Button>
  );
}

export function ExpertsForm() {
  const [state, formAction] = useActionState(submitExpert, initialState);
  const t = useTranslations("experts");

  useEffect(() => {
    if (state.ok) {
      toast.success(t("form_success"));
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  if (state.ok) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="text-success-500 mx-auto h-12 w-12" />
          <h2 className="text-fg-primary mt-4 text-xl font-semibold">{t("form_title")}</h2>
          <p className="text-fg-muted mt-2 text-sm">{t("form_success")}</p>
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
          name="name"
          label={t("form_name")}
          required
          minLength={2}
          maxLength={100}
          error={state.fieldErrors?.name?.[0]}
        />
        <Input
          name="email"
          type="email"
          label={t("form_email")}
          required
          error={state.fieldErrors?.email?.[0]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="title"
          label={t("form_title")}
          required
          minLength={2}
          maxLength={100}
          error={state.fieldErrors?.title?.[0]}
        />
        <Input
          name="institution"
          label={t("form_institution")}
          required
          minLength={2}
          maxLength={100}
          error={state.fieldErrors?.institution?.[0]}
        />
      </div>
      <Select
        name="expertiseArea"
        label={t("form_expertise")}
        required
        placeholder={t("form_expertise_placeholder")}
        defaultValue=""
        options={[
          { value: "legal", label: "Legal & Policy" },
          { value: "medical", label: "Medical & Clinical" },
          { value: "cybersecurity", label: "Cybersecurity" },
          { value: "research", label: "Academic Research" },
          { value: "ethics", label: "Ethics & Philosophy" },
          { value: "policy", label: "Policy & Governance" },
          { value: "design", label: "Design & Human-Computer Interaction" },
          { value: "other", label: "Other" },
        ]}
        error={state.fieldErrors?.expertiseArea?.[0]}
      />
      <Input
        name="linkedinUrl"
        type="url"
        label={t("form_linkedin")}
        error={state.fieldErrors?.linkedinUrl?.[0]}
        placeholder="https://linkedin.com/in/username"
      />
      <div className="pt-2">
        <SubmitBtn>{t("form_submit")}</SubmitBtn>
      </div>
      <p className="text-fg-muted pt-1 text-center text-xs">{t("form_footer")}</p>
    </form>
  );
}
