"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getEcosystemBenchmarks,
  calculateMoatIndex,
  getDefensivePositioningIndex,
  type EcosystemPlayer,
} from "@/lib/analytics/ecosystem-analyzer";
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Cpu,
  Target,
} from "lucide-react";

export function EcosystemBenchmarkWidget() {
  const t = useTranslations("admin");
  const [players] = useState<EcosystemPlayer[]>(() => getEcosystemBenchmarks());
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const moatIndex = calculateMoatIndex(players);
  const positioning = getDefensivePositioningIndex(moatIndex);

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.alparMoat.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedPlayer = selectedPlayerName
    ? (players.find((p) => p.name === selectedPlayerName) ?? null)
    : null;

  return (
    <div className="space-y-8">
      {/* Widget Header & Overview Banner */}
      <div className="border-brand-500/20 from-bg-secondary/80 via-bg-tertiary/40 to-brand-950/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="bg-brand-500/10 pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-brand-500/10 pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Sparkles className="text-brand-400 h-3.5 w-3.5" />
              <span>{t("ecosystem_badge")}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              {t("ecosystem_title")}
            </h2>
            <p className="text-fg-muted text-sm leading-relaxed">{t("ecosystem_description")}</p>
          </div>

          {/* Defensive Positioning Index Card */}
          <div className="min-w-[280px] shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-fg-muted flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase">
                <Target className="text-success-400 h-3.5 w-3.5" />
                {t("ecosystem_moat_index_title")}
              </span>
              <span className="border-success-500/20 bg-success-500/10 text-success-400 rounded-full border px-2 py-0.5 font-mono text-xs font-bold">
                {positioning.tier}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-3xl font-black text-white">{moatIndex}</div>
                <div className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
                  {t("ecosystem_moat_score_max")}
                </div>
              </div>
              <div className="text-right">
                <span className="border-success-500/30 bg-success-500/20 text-success-300 inline-block rounded-md border px-2.5 py-1 text-xs font-extrabold tracking-wide">
                  {positioning.rating}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="to-brand-400 from-success-500 h-full rounded-full bg-gradient-to-r transition-all duration-1000"
                style={{ width: `${moatIndex}%` }}
              />
            </div>
            <p className="text-fg-muted mt-2.5 line-clamp-2 text-[11px] leading-snug">
              {positioning.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("ecosystem_search_placeholder")}
            className="bg-bg-secondary/60 placeholder-fg-muted focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border border-white/10 py-2 pr-4 pl-9 text-xs text-white transition-all focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <button
            onClick={() => setSelectedPlayerName(null)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedPlayerName === null
                ? "bg-brand-500 shadow-brand-500/20 text-white shadow-lg"
                : "bg-bg-tertiary/40 text-fg-muted border border-white/5 hover:text-white"
            }`}
          >
            {t("ecosystem_all_players", { count: players.length })}
          </button>
          {players.map((player) => (
            <button
              key={player.name}
              onClick={() =>
                setSelectedPlayerName(selectedPlayerName === player.name ? null : player.name)
              }
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedPlayerName === player.name
                  ? "bg-brand-500 shadow-brand-500/20 text-white shadow-lg"
                  : "bg-bg-tertiary/40 text-fg-muted border border-white/5 hover:text-white"
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      {/* Player Cards Grid (when all or search active) */}
      {!selectedPlayer && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => (
            <div
              key={player.name}
              className="group bg-bg-secondary/40 hover:border-brand-500/40 hover:shadow-brand-500/5 flex flex-col justify-between rounded-2xl border border-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                      {player.category}
                    </span>
                    <h3 className="group-hover:text-brand-300 mt-2 text-lg font-bold text-white transition-colors">
                      {player.name}
                    </h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-fg-muted block text-xs">
                      {t("ecosystem_card_moat_score")}
                    </span>
                    <span className="text-success-400 font-mono text-xl font-extrabold">
                      {player.moatScore}/100
                    </span>
                  </div>
                </div>

                {/* Success Factors */}
                <div className="space-y-1.5">
                  <div className="text-success-400 flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase">
                    <Zap className="h-3.5 w-3.5" /> {t("ecosystem_card_success_drivers")}
                  </div>
                  <ul className="space-y-1">
                    {player.successFactors.map((sf, idx) => (
                      <li key={idx} className="text-fg-muted flex items-start gap-1.5 text-xs">
                        <CheckCircle2 className="text-success-400 mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{sf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Failure Pitfalls */}
                <div className="space-y-1.5 border-t border-white/5 pt-2">
                  <div className="text-danger-400 flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase">
                    <AlertTriangle className="h-3.5 w-3.5" />{" "}
                    {t("ecosystem_card_critical_pitfalls")}
                  </div>
                  <ul className="space-y-1">
                    {player.failurePitfalls.map((fp, idx) => (
                      <li key={idx} className="text-fg-muted flex items-start gap-1.5 text-xs">
                        <XCircle className="text-danger-400 mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{fp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ALPAR Moat Box */}
              <div className="bg-brand-950/30 border-brand-500/20 -mx-6 mt-5 -mb-6 rounded-b-2xl border-t border-white/10 p-4 pt-4">
                <div className="text-brand-300 mb-1 flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase">
                  <ShieldCheck className="text-brand-400 h-4 w-4" />
                  {t("ecosystem_card_alpar_advantage")}
                </div>
                <p className="text-fg-muted text-xs leading-relaxed">{player.alparMoat}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep-Dive Post-Mortem Comparison Table */}
      <div className="bg-bg-secondary/40 space-y-6 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Layers className="text-brand-400 h-5 w-5" />
              {t("ecosystem_matrix_title")}
            </h3>
            <p className="text-fg-muted mt-1 text-xs">{t("ecosystem_matrix_description")}</p>
          </div>
          <div className="text-fg-muted flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 font-mono text-xs">
            <Cpu className="text-brand-400 h-3.5 w-3.5" />
            <span>{t("ecosystem_matrix_models_tracked", { count: 5 })}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-fg-muted w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-mono text-[10px] tracking-wider text-white uppercase">
                <th className="rounded-tl-xl p-3.5">{t("ecosystem_matrix_col_player")}</th>
                <th className="p-3.5">{t("ecosystem_matrix_col_success")}</th>
                <th className="p-3.5">{t("ecosystem_matrix_col_pitfalls")}</th>
                <th className="p-3.5">{t("ecosystem_matrix_col_moat")}</th>
                <th className="rounded-tr-xl p-3.5 text-right">
                  {t("ecosystem_matrix_col_score")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(selectedPlayer ? [selectedPlayer] : filteredPlayers).map((p) => (
                <tr key={p.name} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="p-3.5 align-top">
                    <div className="group-hover:text-brand-300 text-sm font-bold text-white transition-colors">
                      {p.name}
                    </div>
                    <div className="text-brand-400 mt-0.5 font-mono text-[10px]">{p.category}</div>
                  </td>

                  <td className="space-y-1 p-3.5 align-top">
                    {p.successFactors.map((sf, idx) => (
                      <div key={idx} className="text-fg-muted flex items-start gap-1.5">
                        <CheckCircle2 className="text-success-400 mt-0.5 h-3 w-3 shrink-0" />
                        <span>{sf}</span>
                      </div>
                    ))}
                  </td>

                  <td className="space-y-1 p-3.5 align-top">
                    {p.failurePitfalls.map((fp, idx) => (
                      <div key={idx} className="text-fg-muted flex items-start gap-1.5">
                        <XCircle className="text-danger-400 mt-0.5 h-3 w-3 shrink-0" />
                        <span>{fp}</span>
                      </div>
                    ))}
                  </td>

                  <td className="p-3.5 align-top">
                    <div className="border-brand-500/20 bg-brand-500/10 text-brand-200 rounded-lg border p-2.5 text-xs leading-relaxed">
                      <div className="text-brand-300 mb-1 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="text-brand-400 h-3.5 w-3.5" />
                        {t("ecosystem_matrix_strategic_defense")}
                      </div>
                      {p.alparMoat}
                    </div>
                  </td>

                  <td className="p-3.5 text-right align-top font-mono">
                    <span className="border-success-500/20 bg-success-500/10 text-success-400 inline-block rounded-lg border px-2.5 py-1 text-sm font-bold">
                      {p.moatScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
