import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight, Crown, Sparkles, BrainCircuit } from "lucide-react";

export function AdvisorRoster() {
  const t = useTranslations("admin");
  const twinsList = Object.values(DIGITAL_TWINS).slice(0, 8); // Showcase top 8 in dashboard

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-3xl transition-all duration-500 hover:bg-slate-900/70 hover:shadow-[0_0_80px_rgba(var(--color-amber-500),0.1)]">
      {/* Neo-morphic glowing orb */}
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px] transition-all duration-700 group-hover:bg-amber-500/20" />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px] transition-all duration-700 group-hover:bg-cyan-500/20" />

      <div className="relative z-10 mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
            <Crown className="h-6 w-6" />
            <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md" />
          </div>
          <div>
            <h3 className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              The Council of 30 Sages
            </h3>
            <p className="text-slate-400 text-xs font-medium tracking-wide">
              {t("advisor_roster_desc") || "Autonomous Cyber-Renaissance Intelligence"}
            </p>
          </div>
        </div>
        <Link
          href={`/en/twins-leaderboard`}
          className="group/link flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
        >
          Tümünü Gör (30)
          <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {twinsList.map((twin: DigitalTwinPersona) => {
          return (
            <div
              key={twin.id}
              className="group/card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-black/60 hover:shadow-2xl"
            >
              {/* Dynamic Gradient Background for each card */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-10 bg-gradient-to-br ${twin.stats.badgeGradient}`}
              />
              
              <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    {twin.stats.tier}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    %{twin.stats.successRate} WIN
                  </span>
                </div>
                
                <h4 className="mb-1 text-lg font-bold text-white drop-shadow-md">
                  {twin.name}
                </h4>
                <p className="line-clamp-2 text-xs font-medium text-slate-400">
                  {twin.title}
                </p>
              </div>

              <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    IQ {twin.stats.iqScore}
                  </span>
                </div>
                <Link
                  href={`/en/admin/ai-hub/orchestrator`}
                  className="rounded-full bg-white/10 p-1.5 text-white transition-all hover:bg-brand-500 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
