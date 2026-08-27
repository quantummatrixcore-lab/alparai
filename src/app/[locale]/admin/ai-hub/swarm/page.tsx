"use client";

import { useTranslations } from "next-intl";
import {
  Server,
  Activity,
  Shield,
  Code2,
  Globe,
  DollarSign,
  Terminal,
  ShieldAlert,
} from "lucide-react";

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
    className={`bg-bg-secondary border-border-strong group relative z-10 flex min-w-[280px] flex-col items-center rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl ${
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
      className={`absolute -inset-0.5 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-20 ${
        color === "gold"
          ? "bg-amber-500"
          : color === "purple"
            ? "bg-purple-500"
            : color === "blue"
              ? "bg-blue-500"
              : "bg-emerald-500"
      }`}
    />
    <div className="relative z-10 flex w-full flex-col items-center">
      <div
        className={`mb-4 rounded-xl p-4 ${
          color === "gold"
            ? "border-warning-500/20 border bg-amber-500/10 text-amber-400"
            : color === "purple"
              ? "border border-purple-500/20 bg-purple-500/10 text-purple-400"
              : color === "blue"
                ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                : "border-success-500/20 border bg-emerald-500/10 text-emerald-400"
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-fg-primary text-center text-lg font-semibold tracking-wide">{name}</h3>
      <p className="text-fg-muted mt-1 text-center text-sm font-medium">{role}</p>

      <div className="border-border-strong mt-6 flex w-full items-center justify-between border-t pt-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            tier === "pro"
              ? "border border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
              : "border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
          }`}
        >
          {tierLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2.5 w-2.5">
            {status === "active" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-slate-500"}`}
            ></span>
          </div>
          <span
            className={`text-xs font-medium ${status === "active" ? "text-emerald-400" : "text-fg-muted"}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default function SwarmHierarchyPage() {
  const t = useTranslations("adminSwarm");

  return (
    <div className="bg-bg-secondary relative min-h-screen overflow-hidden p-8 sm:p-12">
      {/* Background glow effects */}
      <div className="bg-brand-500/10 pointer-events-none absolute top-0 left-1/2 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-white">
            <Server className="text-brand-400 h-8 w-8" />
            {t("title")}
          </h1>
          <p className="text-fg-muted mx-auto max-w-2xl text-lg">{t("description")}</p>
        </div>

        {/* Tree Container */}
        <div className="relative flex flex-col items-center gap-16 pb-20">
          {/* Level 1: Supreme Command */}
          <div className="relative">
            <SwarmNode
              name="Gazi Başkomutan"
              role={t("roles.gazi")}
              icon={Shield}
              tier="pro"
              status="active"
              color="gold"
              tierLabel={t("tier.pro")}
              statusLabel={t("status.active")}
            />
            {/* SVG Line down */}
            <svg className="text-fg-secondary absolute top-full left-1/2 z-0 h-16 w-0.5 -translate-x-1/2">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="64"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Level 2: Grand Architect */}
          <div className="relative">
            <SwarmNode
              name="Fatih Sultan Mehmet"
              role={t("roles.fatih")}
              icon={Globe}
              tier="pro"
              status="active"
              color="purple"
              tierLabel={t("tier.pro")}
              statusLabel={t("status.active")}
            />
            {/* SVG Line down */}
            <svg className="text-fg-secondary absolute top-full left-1/2 z-0 h-16 w-0.5 -translate-x-1/2">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="64"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Level 3: Chief Builder */}
          <div className="relative flex w-full flex-col items-center">
            <SwarmNode
              name="Mimar Sinan"
              role={t("roles.sinan")}
              icon={Code2}
              tier="pro"
              status="active"
              color="blue"
              tierLabel={t("tier.pro")}
              statusLabel={t("status.active")}
            />

            {/* Connection to Swarm Divisions */}
            <div className="relative mt-16 w-full max-w-[1200px]">
              {/* Horizontal Line connector */}
              <div className="absolute top-[-32px] right-[10%] left-[10%] h-[2px] border-dashed bg-slate-700/50" />
              {/* Vertical line from Sinan down to Horizontal line */}
              <div className="absolute top-[-64px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />

              <div className="relative grid w-full grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="Yıldırım Kıtaları"
                    role={t("roles.yildirim")}
                    icon={Activity}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="İstihbarat ve Emniyet"
                    role={t("roles.istihbarat")}
                    icon={ShieldAlert}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="Tasarım Komandoları"
                    role={t("roles.tasarim")}
                    icon={Globe}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="Hariciye Dairesi"
                    role={t("roles.hariciye")}
                    icon={Globe}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="Maliye Vekili"
                    role={t("roles.maliye")}
                    icon={DollarSign}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute top-[-32px] left-1/2 h-[32px] w-[2px] -translate-x-1/2 border-dashed bg-slate-700/50" />
                  <SwarmNode
                    name="Siber Birlikler"
                    role={t("roles.siber")}
                    icon={Terminal}
                    tier="flash"
                    status="active"
                    color="emerald"
                    tierLabel={t("tier.flash")}
                    statusLabel={t("status.active")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
