import { Cpu, ShieldCheck, Warning } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AuditFlowDiagram() {
  const t = useTranslations("admin");
  return (
    <div className="border-border-subtle bg-bg-secondary/40 flex h-full flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
      <div>
        <h3 className="mb-1 text-xs font-bold tracking-wider text-white uppercase">
          {t("cross_audit_consensus_flow")}
        </h3>
        <p className="text-fg-muted mb-6 text-[11px]">
          {t("multi_agent_verification_pipeline_showin")}
        </p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-4">
        {/* SVG Flow lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <path
            d="M 50 100 L 150 40"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_15s_linear_infinite]"
          />
          <path
            d="M 50 100 L 150 70"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_12s_linear_infinite]"
          />
          <path
            d="M 50 100 L 150 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_10s_linear_infinite]"
          />
          <path
            d="M 50 100 L 150 130"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_12s_linear_infinite]"
          />
          <path
            d="M 50 100 L 150 160"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_15s_linear_infinite]"
          />

          <path
            d="M 230 40 L 330 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_15s_linear_infinite]"
          />
          <path
            d="M 230 70 L 330 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_12s_linear_infinite]"
          />
          <path
            d="M 230 100 L 330 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_10s_linear_infinite]"
          />
          <path
            d="M 230 130 L 330 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_12s_linear_infinite]"
          />
          <path
            d="M 230 160 L 330 100"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            className="animate-[flow-line_15s_linear_infinite]"
          />
        </svg>

        <div className="relative z-10 flex min-h-[200px] w-full items-center justify-between px-2">
          {/* Left Node: Input Incident */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-brand-500/10 border-brand-500/30 text-brand-400 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Warning className="h-6 w-6" />
            </div>
            <span className="text-fg-muted text-[9px] font-bold tracking-wider uppercase">
              {t("report")}
            </span>
          </div>

          {/* Center Nodes: 5 AI Models */}
          <div className="flex w-full max-w-[150px] flex-col gap-1.5">
            {[
              { name: "GPT-4o", score: "96%" },
              { name: "Claude 3.5", score: "99%" },
              { name: "Gemini 1.5", score: "94%" },
              { name: "Llama 3.1", score: "89%" },
              { name: "Mixtral", score: "85%" },
            ].map((model, idx) => (
              <div
                key={model.name}
                className="bg-bg-secondary/90 border-border-subtle/60 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1 text-[11px] backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu
                    className={cn("h-3 w-3", idx % 2 === 0 ? "text-cyan-400" : "text-purple-400")}
                  />
                  <span className="font-mono font-medium text-white/80">{model.name}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">{model.score}</span>
              </div>
            ))}
          </div>

          {/* Right Node: Consensus Result */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="h-6 w-6 animate-pulse" />
            </div>
            <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
              {t("consensus")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
