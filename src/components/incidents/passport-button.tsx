"use client";

import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getIncidentPassport } from "@/actions/incident-passport";
import { toast } from "sonner";

export function PassportButton({ incidentId }: { incidentId: string }) {
  const [pending, start] = useTransition();
  const t = useTranslations("incident");

  const handleDownload = () => {
    start(async () => {
      const res = await getIncidentPassport(incidentId);
      if (!res.ok) {
        toast.error(res.error ?? t("passport_error"));
        return;
      }
      const blob = new Blob([JSON.stringify(res.passport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incident-${incidentId}-eu-ai-act-passport.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("passport_downloaded"));
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={
        pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )
      }
      onClick={handleDownload}
      disabled={pending}
      className="w-full"
    >
      {t("passport_btn")}
    </Button>
  );
}
