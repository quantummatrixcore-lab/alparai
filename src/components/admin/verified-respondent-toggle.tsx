"use client";

import * as React from "react";
import { useState } from "react";
import { toggleVerifiedRespondent } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface VerifiedRespondentToggleProps {
  providerId: string;
  isVerified: boolean;
  contactEmail: string | null;
  providerName: string;
}

export function VerifiedRespondentToggle({
  providerId,
  isVerified,
  contactEmail,
  providerName,
}: VerifiedRespondentToggleProps) {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(contactEmail || "");

  const handleToggle = async () => {
    if (isVerified) {
      if (confirm(t("verified_revoke_confirm", { providerName }))) {
        setLoading(true);
        try {
          const res = await toggleVerifiedRespondent(providerId, false);
          if (res.ok) {
            toast.success(t("verified_status_revoked"));
          } else {
            toast.error(res.error || t("verified_status_revoke_failed"));
          }
        } catch {
          toast.error(t("verified_status_revoke_failed"));
        } finally {
          setLoading(false);
        }
      }
    } else {
      setOpen(true);
    }
  };

  const handleConfirmVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setLoading(true);
    try {
      const res = await toggleVerifiedRespondent(providerId, true, email);
      if (res.ok) {
        toast.success(t("verified_status_granted"));
      } else {
        toast.error(res.error || t("verified_status_grant_failed"));
      }
    } catch {
      toast.error(t("verified_status_grant_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isVerified ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className="gap-1.5 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{t("verified_label")}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className="gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{t("unverified_label")}</span>
          </Button>
        )}
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("verify_modal_title")}
        description={t("verify_modal_desc", { providerName })}
      >
        <form onSubmit={handleConfirmVerify} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-fg-primary block text-sm font-medium">
              {t("verify_modal_email_label")}
            </label>
            <Input
              type="email"
              placeholder={t("verify_modal_email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bg-tertiary"
            />
            <p className="text-fg-muted text-[11px]">{t("verify_modal_email_hint")}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {t("verify_modal_confirm_btn")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
