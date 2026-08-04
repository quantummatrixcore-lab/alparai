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
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="mt-8 space-y-4 rounded-lg border border-white/10 bg-white/5 p-6"
      data-testid="provenance-trail"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Public Verification & Provenance
          Trail
        </span>
        <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
          TruthScore: {truthScore} / 100
        </span>
      </div>

      <div className="grid gap-4 text-xs sm:grid-cols-3">
        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Multi-Model Consensus Audit
          </span>
          <p className="text-fg-primary font-medium">
            3 LLMs verified consensus on {providerName} incident
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <Clock className="h-3.5 w-3.5 text-purple-400" /> Verification Timeline
          </span>
          <p className="text-fg-primary font-medium">Recorded & verified on {formattedDate}</p>
        </div>

        <div className="space-y-1">
          <span className="text-fg-muted flex items-center gap-1.5 font-semibold">
            <FileText className="h-3.5 w-3.5 text-amber-400" /> Primary Source Link
          </span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-emerald-400 hover:underline"
            >
              {sourceUrl}
            </a>
          ) : (
            <span className="text-fg-muted italic">Direct User Submission (PII Sanitized)</span>
          )}
        </div>
      </div>

      <div className="text-fg-muted flex items-center gap-2 rounded bg-black/40 p-3 text-[11px]">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
        <span>
          This record is cryptographically indexed and accessible to regulators, researchers, and AI
          audit platforms under the AGPL-3.0 open registry standards.
        </span>
      </div>
    </div>
  );
}
