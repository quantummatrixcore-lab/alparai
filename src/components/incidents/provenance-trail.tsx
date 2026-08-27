"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, CheckCircle2, FileText, Cpu, Clock } from "lucide-react";

interface ProvenanceTrailProps {
  incidentId: string;
  createdAt: string;
  sourceUrl?: string | null;
  providerName?: string;
  truthScore?: number;
}

export function ProvenanceTrail({
  createdAt,
  sourceUrl,
  providerName = "AI System",
  truthScore = 92.4,
}: ProvenanceTrailProps) {
  const t = useTranslations("incident");
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="border-border-subtle mt-8 space-y-4 rounded-lg border bg-white/5 p-6"
      data-testid="provenance-trail"
    >
      <div className="border-border-subtle flex items-center justify-between border-b pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="text-success-400 h-4 w-4" /> {t("provenance_title")}
        </span>
        <span className="border-success-500/30 bg-success-500/20 text-success-400 rounded border px-2.5 py-0.5 font-mono text-xs font-bold">
          TruthScore: {truthScore} / 100
        </span>
      </div>

      <div className="grid gap-4 text-xs sm:grid-cols-3">
        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <Cpu className="text-accent-400 h-3.5 w-3.5" /> {t("provenance_consensus_title")}
          </span>
          <p className="text-fg-primary font-medium">
            {t("provenance_consensus_desc", { count: 3, provider: providerName })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <Clock className="text-brand-400 h-3.5 w-3.5" /> {t("provenance_timeline_title")}
          </span>
          <p className="text-fg-primary font-medium">
            {t("provenance_timeline_desc", { date: formattedDate })}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <FileText className="text-warning-400 h-3.5 w-3.5" /> {t("provenance_source_title")}
          </span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-success-400 block truncate hover:underline"
            >
              {sourceUrl}
            </a>
          ) : (
            <span className="text-fg-muted italic">{t("provenance_source_direct")}</span>
          )}
        </div>
      </div>

      <div className="text-fg-muted flex items-center gap-2 rounded bg-black/40 p-3 text-[11px]">
        <CheckCircle2 className="text-success-400 h-4 w-4 flex-shrink-0" />
        <span>{t("provenance_legal_footer")}</span>
      </div>
    </div>
  );
}
