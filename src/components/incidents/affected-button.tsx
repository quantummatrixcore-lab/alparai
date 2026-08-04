"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAffectedStatus } from "@/actions/comments";
import { toast } from "sonner";

export function AffectedButton({
  incidentId,
  initialAffectedCount,
  initialUserAffected,
  disabled = false,
}: {
  incidentId: string;
  initialAffectedCount: number;
  initialUserAffected: boolean;
  disabled?: boolean;
}) {
  const locale = useLocale();
  const [affected, setAffected] = useState(initialUserAffected);
  const [count, setCount] = useState(initialAffectedCount);
  const [pending, startTransition] = useTransition();

  const textLabel = locale === "tr" ? "Ben de Yaşadım" : "Me Too";
  const textAffected =
    locale === "tr"
      ? "Bu sorundan etkilendiğinizi belirttiniz."
      : "You marked yourself as affected.";

  const handleToggle = () => {
    if (disabled || pending) {
      if (disabled) {
        toast.error(
          locale === "tr"
            ? "Etkilendiğinizi belirtmek için giriş yapmalısınız."
            : "You must sign in to mark yourself as affected.",
        );
      }
      return;
    }
    const previousState = affected;
    setAffected(!previousState);
    setCount((prev) => (previousState ? Math.max(0, prev - 1) : prev + 1));

    startTransition(async () => {
      const res = await toggleAffectedStatus(incidentId);
      if (!res.ok) {
        setAffected(previousState);
        setCount(initialAffectedCount);
        toast.error(res.error || "Action failed");
      } else {
        if (res.affected) {
          toast.success(textAffected);
        }
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        "border-border-subtle hover:border-brand-500/50 bg-bg-secondary focus:ring-brand-500/30 flex w-full items-center justify-between gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 focus:ring-1 focus:outline-none",
        affected
          ? "bg-brand-500/10 border-brand-500/40 text-brand-400 font-semibold"
          : "text-fg-secondary hover:text-fg-primary",
        pending && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className={cn("h-5 w-5", affected ? "text-brand-400" : "text-fg-muted")} />
        <span className="text-sm font-medium">{textLabel}</span>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-bold",
          affected ? "bg-brand-500/20 text-brand-300" : "bg-bg-tertiary text-fg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}
