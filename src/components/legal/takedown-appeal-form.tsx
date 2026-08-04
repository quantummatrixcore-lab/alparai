"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitTakedownAppeal } from "@/actions/appeal";

export function TakedownAppealForm({
  takedownId,
  incidentId,
}: {
  takedownId?: string;
  incidentId?: string;
}) {
  const t = useTranslations("legal");
  const [pending, start] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="border-success-500/30 bg-success-500/5">
        <CardContent className="py-10 text-center">
          <CheckCircle2 className="text-success-500 mx-auto h-12 w-12" />
          <h3 className="text-fg-primary mt-4 text-xl font-bold">
            {t("appealReceivedTitle", { defaultValue: "Appeal Received" })}
          </h3>
          <p className="text-fg-muted mx-auto mt-2 max-w-md text-sm">
            {t("appealReceivedDesc", {
              defaultValue:
                "Your appeal has been logged. Our moderation council will review the counter-evidence and issue a decision within 24 hours.",
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-bg-surface">
      <CardHeader>
        <CardTitle className="text-fg-primary flex items-center gap-2 text-xl font-bold">
          <ShieldAlert className="text-brand-400 h-5 w-5" />
          {t("appealFormTitle", { defaultValue: "Submit Takedown Appeal" })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const res = await submitTakedownAppeal({
                takedownId: takedownId || String(fd.get("takedown_id") ?? ""),
                incidentId: incidentId || String(fd.get("incident_id") ?? ""),
                appellantName: String(fd.get("appellant_name") ?? ""),
                appellantEmail: String(fd.get("appellant_email") ?? ""),
                reason: String(fd.get("reason") ?? ""),
                evidenceUrl: String(fd.get("evidence_url") ?? ""),
              });
              if (res.ok) {
                setSubmitted(true);
              } else {
                toast.error(res.error ?? t("failed", { defaultValue: "Failed to submit appeal" }));
              }
            });
          }}
          className="space-y-4"
        >
          {!takedownId && (
            <div className="space-y-1">
              <label className="text-fg-muted text-xs font-medium">
                {t("takedownIdLabel", {
                  defaultValue: "Takedown / Request Reference ID (Optional)",
                })}
              </label>
              <Input name="takedown_id" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" />
            </div>
          )}

          {!incidentId && (
            <div className="space-y-1">
              <label className="text-fg-muted text-xs font-medium">
                {t("incidentIdLabel", { defaultValue: "Incident ID (Optional)" })}
              </label>
              <Input name="incident_id" placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-fg-muted text-xs font-medium">
                {t("appellantNameLabel", { defaultValue: "Your Full Name *" })}
              </label>
              <Input
                name="appellant_name"
                required
                placeholder={t("appellantNamePlaceholder", { defaultValue: "Jane Doe" })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-fg-muted text-xs font-medium">
                {t("appellantEmailLabel", { defaultValue: "Contact Email Address *" })}
              </label>
              <Input
                name="appellant_email"
                type="email"
                required
                placeholder={t("appellantEmailPlaceholder", { defaultValue: "jane@company.com" })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-fg-muted text-xs font-medium">
              {t("appealReasonLabel", { defaultValue: "Reason & Counter-Evidence for Appeal *" })}
            </label>
            <Textarea
              name="reason"
              required
              minLength={20}
              maxLength={4000}
              rows={4}
              placeholder={t("appealReasonPlaceholder", {
                defaultValue:
                  "Explain clearly why the content removal or takedown request was incorrect or unfounded, and provide counter-facts.",
              })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-fg-muted text-xs font-medium">
              {t("evidenceUrlLabel", { defaultValue: "Evidence Document / Proof Link (URL)" })}
            </label>
            <Input name="evidence_url" type="url" placeholder="https://drive.google.com/..." />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={pending} className="w-full">
              {t("submitAppealBtn", { defaultValue: "Submit Appeal" })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
