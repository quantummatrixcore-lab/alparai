"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useTranslations } from "next-intl";
import { submitTakedown } from "@/actions/takedown";
import { toast } from "sonner";
import { TAKEDOWN_REASON_OPTIONS } from "@/lib/constants/takedown-reasons";

const REASONS = TAKEDOWN_REASON_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.translationKey,
}));

export function TakedownButton({ incidentId }: { incidentId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const t = useTranslations("incident");
  const tr = useTranslations("takedown.reasons");
  const tForms = useTranslations("forms");
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Flag className="h-3.5 w-3.5" />}
        onClick={() => setOpen(true)}
        className="w-full"
      >
        {t("report_inappropriate")}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("takedown")}
        description={t("takedownDesc", {
          defaultValue:
            "Submit a takedown or correction request. We review all submissions within 24 hours.",
        })}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            start(async () => {
              const res = await submitTakedown({
                incidentId,
                reason: String(formData.get("reason") ?? ""),
                details: String(formData.get("details") ?? ""),
                contactEmail: String(formData.get("contact_email") ?? ""),
              });
              if (res.ok) {
                toast.success(res.message ?? "Submitted");
                setOpen(false);
              } else {
                toast.error(res.error ?? "Failed");
              }
            });
          }}
          className="space-y-4"
        >
          <Select
            name="reason"
            label={tForms("selectReason")}
            required
            placeholder={tForms("selectReason")}
            options={REASONS.map((r) => ({ value: r.value, label: tr(r.value) }))}
          />
          <Textarea
            name="details"
            label={tForms("details")}
            required
            minLength={20}
            maxLength={2000}
            rows={4}
            placeholder={tForms("explainIssue")}
          />
          <Textarea
            name="contact_email"
            label={tForms("contactEmail")}
            required
            placeholder={tForms("emailPlaceholder", { defaultValue: "you@example.com" })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {tForms("cancel")}
            </Button>
            <Button type="submit" variant="danger" isLoading={pending}>
              {tForms("submit")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
