"use client";

import { useTranslations } from "next-intl";
import { Server, Activity, Shield, Code2, Globe, DollarSign, Terminal, ShieldAlert } from "lucide-react";

const SwarmNode = ({
  name,
  role,
  icon: Icon,
  tier,
  status,
  color,
  tierLabel,
  statusLabel,
}: {
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: "pro" | "flash";
  status: "active" | "idle";
  color: string;
  tierLabel: string;
  statusLabel: string;
}) => (
  <div
    className={`relative flex flex-col items-center p-6 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl group min-w-[280px] z-10 ${
      color === "gold"
        ? "hover:border-amber-500/50 hover:shadow-amber-500/10"
        : color === "purple"
          ? "hover:border-purple-500/50 hover:shadow-purple-500/10"
          : color === "blue"
            ? "hover:border-blue-500/50 hover:shadow-blue-500/10"
            : "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
    }`}
  >
    <div
      className={`absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500 ${
        color === "gold"
          ? "bg-amber-500"
          : color === "purple"
            ? "bg-purple-500"
            : color === "blue"
              ? "bg-blue-500"
              : "bg-emerald-500"
      }`}
    />
    <div className="relative z-10 flex flex-col items-center w-full">
      <div
        className={`p-4 rounded-xl mb-4 ${
          color === "gold"
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            : color === "purple"
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              : color === "blue"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        }`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 tracking-wide text-center">{name}</h3>
      <p className="text-sm text-slate-400 mt-1 font-medium text-center">{role}</p>

      <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-slate-700/50">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            tier === "pro" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          }`}
        >
          {tierLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2.5 w-2.5">
            {status === "active" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "active" ? "bg-emerald-500" : "bg-slate-500"}`}></span>
          </div>
          <span className={`text-xs font-medium ${status === "active" ? "text-emerald-400" : "text-slate-400"}`}>{statusLabel}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function SwarmHierarchyPage() {
  const t = useTranslations("adminSwarm");

  return (
    <div className="min-h-screen bg-slate-950 p-8 sm:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
            <Server className="w-8 h-8 text-brand-400" />
            {t("title")}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t("description")}</p>
        </div>

        {/* Tree Container */}
        <div className="relative flex flex-col items-center gap-16 pb-20">
          {/* Level 1: Supreme Command */}
          <div className="relative">
            <SwarmNode name="Gazi Başkomutan" role={t("roles.gazi")} icon={Shield} tier="pro" status="active" color="gold" tierLabel={t("tier.pro")} statusLabel={t("status.active")} />
            {/* SVG Line down */}
            <svg className="absolute left-1/2 top-full -translate-x-1/2 w-0.5 h-16 text-slate-700/50 z-0">
              <line x1="0" y1="0" x2="0" y2="64" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Level 2: Grand Architect */}
          <div className="relative">
            <SwarmNode name="Fatih Sultan Mehmet" role={t("roles.fatih")} icon={Globe} tier="pro" status="active" color="purple" tierLabel={t("tier.pro")} statusLabel={t("status.active")} />
            {/* SVG Line down */}
            <svg className="absolute left-1/2 top-full -translate-x-1/2 w-0.5 h-16 text-slate-700/50 z-0">
              <line x1="0" y1="0" x2="0" y2="64" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Level 3: Chief Builder */}
          <div className="relative w-full flex flex-col items-center">
            <SwarmNode name="Mimar Sinan" role={t("roles.sinan")} icon={Code2} tier="pro" status="active" color="blue" tierLabel={t("tier.pro")} statusLabel={t("status.active")} />
            
            {/* Connection to Swarm Divisions */}
            <div className="relative w-full mt-16 max-w-[1200px]">
              {/* Horizontal Line connector */}
              <div className="absolute left-[10%] right-[10%] top-[-32px] h-[2px] bg-slate-700/50 border-dashed" />
              {/* Vertical line from Sinan down to Horizontal line */}
              <div className="absolute left-1/2 top-[-64px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative pt-8">
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="Yıldırım Kıtaları" role={t("roles.yildirim")} icon={Activity} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="İstihbarat ve Emniyet" role={t("roles.istihbarat")} icon={ShieldAlert} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="Tasarım Komandoları" role={t("roles.tasarim")} icon={Globe} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="Hariciye Dairesi" role={t("roles.hariciye")} icon={Globe} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="Maliye Vekili" role={t("roles.maliye")} icon={DollarSign} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
                <div className="relative flex justify-center">
                   <div className="absolute left-1/2 top-[-32px] w-[2px] h-[32px] bg-slate-700/50 -translate-x-1/2 border-dashed" />
                   <SwarmNode name="Siber Birlikler" role={t("roles.siber")} icon={Terminal} tier="flash" status="active" color="emerald" tierLabel={t("tier.flash")} statusLabel={t("status.active")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
