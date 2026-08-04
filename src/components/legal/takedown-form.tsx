"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useTransition, useState } from "react";
import { submitTakedownRequest } from "@/actions/takedown";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { TAKEDOWN_REASON_OPTIONS } from "@/lib/constants/takedown-reasons";

const REASONS = TAKEDOWN_REASON_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.translationKey,
}));

export function TakedownForm() {
  const t = useTranslations("legal");
  const tr = useTranslations("takedown.reasons");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="border-success-500/30 bg-success-500/5 rounded-xl border p-6 text-center">
        <CheckCircle2 className="text-success-500 mx-auto h-10 w-10" />
        <h3 className="text-fg-primary mt-3 text-lg font-semibold">
          {t("takedownReceived", { defaultValue: "Request received" })}
        </h3>
        <p className="text-fg-muted mt-2 text-sm">
          {t("takedownReceivedDesc", {
            defaultValue:
              "We review takedown requests within 24 hours. You will receive a response at the email you provided.",
          })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await submitTakedownRequest({
            target_url: String(fd.get("target_url") ?? ""),
            reason: String(fd.get("reason") ?? ""),
            details: String(fd.get("details") ?? ""),
            requester_name: String(fd.get("requester_name") ?? ""),
            requester_email: String(fd.get("requester_email") ?? ""),
            organization: String(fd.get("organization") ?? ""),
            country: String(fd.get("country") ?? ""),
            identity_proof_url: String(fd.get("identity_proof_url") ?? ""),
          });
          if (res.ok) setDone(true);
          else toast.error(res.error ?? t("failed", { defaultValue: "Failed" }));
        });
      }}
      className="space-y-4"
    >
      <Input
        name="target_url"
        label={t("takedownTarget", { defaultValue: "URL of the content" })}
        placeholder="https://alparai.com/incidents/…"
        required
        type="url"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="requester_name"
          label={t("takedownName", { defaultValue: "Your full name" })}
          required
        />
        <Input
          name="requester_email"
          label={t("takedownEmail", { defaultValue: "Your email" })}
          required
          type="email"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="organization"
          label={t("takedownOrg", { defaultValue: "Organization (optional)" })}
        />
        <Input name="country" label={t("takedownCountry", { defaultValue: "Country" })} required />
      </div>
      <Select
        name="reason"
        label={t("takedownReason", { defaultValue: "Reason" })}
        required
        placeholder="Select"
        options={REASONS.map((r) => ({ value: r.value, label: tr(r.value) }))}
      />
      <Textarea
        name="details"
        label={t("takedownDetails", { defaultValue: "Details" })}
        required
        minLength={50}
        maxLength={4000}
        rows={6}
        placeholder={t("takedownDetailsPlaceholder", {
          defaultValue: "Provide a clear explanation with supporting evidence.",
        })}
      />
      <Input
        name="identity_proof_url"
        label={t("takedownProof", { defaultValue: "Link to identity proof (URL)" })}
        required
        type="url"
        placeholder="https://…"
        hint={t("takedownProofHint", {
          defaultValue:
            "Public link to a document proving your identity / authority over the claim.",
        })}
      />
      <Button type="submit" variant="danger" isLoading={pending} size="lg" className="w-full">
        {t("takedownSubmit", { defaultValue: "Submit takedown request" })}
      </Button>
    </form>
  );
}
