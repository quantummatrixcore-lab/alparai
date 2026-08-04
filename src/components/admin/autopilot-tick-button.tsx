"use client";

import { useState, useTransition } from "react";
import { triggerAutopilotWorkerTick } from "@/actions/admin-autopilot";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function WorkerTickButton() {
  const t = useTranslations("autopilot");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const handle = () => {
    startTransition(async () => {
      const r = await triggerAutopilotWorkerTick();
      if (r.ok) {
        setResult(`${r.processed}/${r.succeeded}/${r.retried}/${r.failed}`);
      } else {
        setResult(r.error ?? "error");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-3">
      <Button type="button" size="sm" onClick={handle} disabled={isPending} variant="secondary">
        <Play className="mr-1 h-4 w-4" />
        {t("tick_button")}
      </Button>
      {result ? <span className="text-fg-muted text-xs">{result}</span> : null}
    </div>
  );
}
