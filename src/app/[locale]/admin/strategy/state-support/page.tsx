import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdvisor } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { StateSupport } from "@/types";
import {
  Building,
  Globe,
  TrendingUp,
  Clock,
  XCircle,
  ExternalLink,
  Award,
  Banknote,
  AlertTriangle,
  Filter,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("state_support_title")} | ALPAR AI Admin`,
  };
}

const PRIORITY_CONFIG = {
  1: {
    label: "CRITICAL",
    labelTR: "KRİTİK",
    className: "bg-danger-500/20 text-danger-400 border-danger-500/30",
    dotClass: "bg-danger-400",
  },
  2: {
    label: "HIGH",
    labelTR: "YÜKSEK",
    className: "bg-warning-500/20 text-warning-400 border-warning-500/30",
    dotClass: "bg-warning-400",
  },
  3: {
    label: "MEDIUM",
    labelTR: "ORTA",
    className: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    dotClass: "bg-brand-400",
  },
  4: {
    label: "LOW",
    labelTR: "DÜŞÜK",
    className: "bg-white/5 text-fg-muted border-white/10",
    dotClass: "bg-fg-muted",
  },
} as const;

const STATUS_CONFIG = {
  open: {
    icon: Clock,
    label: "Open",
    labelTR: "Açık",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    glow: "shadow-[0_0_8px_rgba(52,211,153,0.2)]",
  },
  applied: {
    icon: TrendingUp,
    label: "Applied",
    labelTR: "Başvuruldu",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.2)]",
  },
  awarded: {
    icon: Award,
    label: "Awarded",
    labelTR: "Kazanıldı",
    className: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    glow: "shadow-[0_0_8px_rgba(168,85,247,0.2)]",
  },
  closed: {
    icon: XCircle,
    label: "Closed",
    labelTR: "Kapandı",
    className: "text-fg-muted bg-white/5 border-white/10",
    glow: "",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    labelTR: "Reddedildi",
    className: "text-danger-400/60 bg-danger-500/5 border-danger-500/10",
    glow: "",
  },
} as const;

const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  rd: { en: "R&D", tr: "Ar-Ge" },
  market_entry: { en: "Market Entry", tr: "Pazar Girişi" },
  regulatory: { en: "Regulatory", tr: "Düzenleyici" },
  grant: { en: "Grant", tr: "Hibe" },
  tax_incentive: { en: "Tax Incentive", tr: "Vergi Teşviği" },
  equity: { en: "Equity", tr: "Öz Sermaye" },
  loan: { en: "Loan", tr: "Kredi" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  TR: "🇹🇷",
  EU: "🇪🇺",
  US: "🇺🇸",
  UK: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
};

function formatAmount(amount: number | null, currency: string, locale: string): string {
  if (!amount) return "—";
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "TRY" ? "₺" : "€";
  const num = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${sym}${num}`;
}

function formatDeadline(
  deadline: string | null,
  locale: string,
  continuousText: string,
  rollingText: string,
): string {
  if (!deadline) return locale === "tr" ? continuousText : rollingText;
  const d = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (daysLeft < 0) return formatted;
  if (daysLeft <= 30) return `⚡ ${formatted}`;
  return formatted;
}

function FitScoreBar({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-emerald-500"
      : score >= 70
        ? "bg-brand-500"
        : score >= 50
          ? "bg-amber-500"
          : "bg-danger-500";
  return (
    <div className="flex items-center gap-2">
      <div className="bg-bg-tertiary/50 h-1.5 w-16 overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-xs font-bold text-white/70">{score}</span>
    </div>
  );
}

export default async function StateSupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  await requireAdvisor();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("strategy_state_support")
    .select("*")
    .order("priority", { ascending: true })
    .order("fit_score", { ascending: false })
    .order("deadline", { ascending: true, nullsFirst: false });

  const programs = (data ?? []) as unknown as StateSupport[];

  const nowMs = new Date().getTime();
  const urgentProgramIds = new Set(
    programs
      .filter(
        (p) =>
          p.deadline !== null &&
          Math.ceil((new Date(p.deadline).getTime() - nowMs) / (1000 * 60 * 60 * 24)) <= 30,
      )
      .map((p) => p.id),
  );

  const totalOpen = programs.filter((p) => p.status === "open").length;
  const totalApplied = programs.filter((p) => p.status === "applied").length;
  const totalAwarded = programs.filter((p) => p.status === "awarded").length;
  const criticalCount = programs.filter((p) => p.priority === 1 && p.status === "open").length;

  const kpis = [
    {
      label: locale === "tr" ? "Toplam Program" : "Total Programs",
      value: programs.length,
      icon: Building,
      color: "text-white",
      glow: "rgba(255,255,255,0.05)",
    },
    {
      label: locale === "tr" ? "Açık Başvuru" : "Open Programs",
      value: totalOpen,
      icon: Globe,
      color: "text-emerald-400",
      glow: "rgba(52,211,153,0.1)",
    },
    {
      label: locale === "tr" ? "Başvuruldu" : "Applied",
      value: totalApplied,
      icon: TrendingUp,
      color: "text-amber-400",
      glow: "rgba(251,191,36,0.1)",
    },
    {
      label: locale === "tr" ? "Kazanıldı" : "Awarded",
      value: totalAwarded,
      icon: Award,
      color: "text-brand-400",
      glow: "rgba(168,85,247,0.1)",
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-brand-500/10 border-brand-500/20 rounded-lg border p-2">
                  <Banknote className="text-brand-400 h-5 w-5" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  {t("state_support_title")}
                </h1>
              </div>
              <p className="text-fg-muted ml-12 text-sm">{t("state_support_subtitle")}</p>
            </div>
            {criticalCount > 0 && (
              <div className="bg-danger-500/10 border-danger-500/30 flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2">
                <AlertTriangle className="text-danger-400 h-4 w-4" />
                <span className="text-danger-400 text-sm font-bold">
                  {t("critical_open_opportunities", { count: criticalCount })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPI Bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-5 backdrop-blur-sm"
                style={{ boxShadow: `inset 0 0 30px ${kpi.glow}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-fg-muted mb-1 text-[10px] font-bold tracking-wider uppercase">
                      {kpi.label}
                    </p>
                    <p className={`text-3xl font-black tabular-nums ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error state */}
        {error && (
          <div className="border-danger-500/30 bg-danger-500/10 mb-6 rounded-xl border px-4 py-3">
            <p className="text-danger-400 text-sm font-semibold">
              {locale === "tr" ? "Veri yüklenemedi: " : "Failed to load data: "}
              {error.message}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!error && programs.length === 0 && (
          <div className="border-border-subtle bg-bg-secondary/30 rounded-2xl border py-20 text-center">
            <Building className="text-fg-muted mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-fg-secondary text-sm font-semibold">{t("state_support_empty")}</p>
          </div>
        )}

        {/* Ranked Table */}
        {programs.length > 0 && (
          <div className="border-border-subtle bg-bg-secondary/30 overflow-hidden rounded-2xl border backdrop-blur-sm">
            {/* Table header */}
            <div className="border-border-subtle flex items-center gap-2 border-b px-6 py-4">
              <Filter className="text-fg-muted h-4 w-4" />
              <span className="text-fg-secondary text-xs font-bold tracking-wider uppercase">
                {programs.length} {t("programs_sorted_by_priority_fit_score_de")}
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-border-subtle border-b">
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("state_support_col_priority")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("state_support_col_program")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("kurum_grantor")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("kategori_category")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-right text-[10px] font-bold tracking-wider uppercase">
                      {t("state_support_col_amount")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("state_support_col_status")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("fit_score")}
                    </th>
                    <th className="text-fg-muted px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase">
                      {t("state_support_col_timeline")}
                    </th>
                    <th className="text-fg-muted w-10 px-4 py-3 text-center text-[10px] font-bold tracking-wider uppercase">
                      {t("url")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {programs.map((program) => {
                    const priorityCfg = PRIORITY_CONFIG[program.priority as 1 | 2 | 3 | 4];
                    const statusCfg = STATUS_CONFIG[program.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = statusCfg.icon;
                    const flag = COUNTRY_FLAGS[program.country] ?? "🌐";
                    const catLabel = CATEGORY_LABELS[program.category];
                    const isUrgent = urgentProgramIds.has(program.id);

                    return (
                      <tr
                        key={program.id}
                        className="transition-colors duration-150 hover:bg-white/[0.02]"
                      >
                        {/* Priority */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-[0.15em] uppercase ${priorityCfg.className}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dotClass}`} />
                            {locale === "tr" ? priorityCfg.labelTR : priorityCfg.label}
                          </span>
                        </td>

                        {/* Program */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg leading-none" title={program.country}>
                              {flag}
                            </span>
                            <div>
                              <p className="font-bold text-white">{program.name}</p>
                              <p className="text-fg-muted font-mono text-[10px]">{program.code}</p>
                            </div>
                          </div>
                          {program.notes && (
                            <p className="text-fg-muted mt-1.5 line-clamp-2 max-w-[280px] text-[11px] leading-relaxed">
                              {program.notes}
                            </p>
                          )}
                        </td>

                        {/* Grantor */}
                        <td className="px-4 py-4">
                          <p className="text-fg-secondary text-xs font-semibold">
                            {program.grantor}
                          </p>
                          {program.region && (
                            <p className="text-fg-muted text-[10px]">{program.region}</p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="text-fg-secondary rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {catLabel
                              ? locale === "tr"
                                ? catLabel.tr
                                : catLabel.en
                              : program.category}
                          </span>
                        </td>

                        {/* Max Amount */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-mono text-xs font-bold text-white/80">
                            {formatAmount(program.max_amount_eur, program.currency, locale)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold ${statusCfg.className} ${statusCfg.glow}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {locale === "tr" ? statusCfg.labelTR : statusCfg.label}
                          </span>
                          {program.awarded_at && (
                            <p className="text-fg-muted mt-1 text-[10px]">
                              {new Date(program.awarded_at).toLocaleDateString(
                                locale === "tr" ? "tr-TR" : "en-US",
                                { month: "short", year: "numeric" },
                              )}
                            </p>
                          )}
                        </td>

                        {/* Fit Score */}
                        <td className="px-4 py-4">
                          <FitScoreBar score={program.fit_score} />
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs font-semibold ${isUrgent ? "text-amber-400" : "text-fg-secondary"}`}
                          >
                            {formatDeadline(program.deadline, locale, "Sürekli", "Rolling")}
                          </span>
                        </td>

                        {/* URL */}
                        <td className="px-4 py-4 text-center">
                          {program.url ? (
                            <a
                              href={program.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-400 hover:text-brand-300 transition-colors"
                              title={program.url}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-fg-muted/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-border-subtle flex items-center justify-between border-t px-6 py-3">
              <span className="text-fg-muted text-[10px]">
                {locale === "tr"
                  ? "Sıralama: Öncelik (Kritik→Düşük) · Uygunluk Skoru (Yüksek→Düşük) · Son Tarih (Yakın→Uzak)"
                  : "Sort: Priority (Critical→Low) · Fit Score (High→Low) · Deadline (Soonest first)"}
              </span>
              <span className="text-fg-muted text-[10px]">
                {locale === "tr" ? "Son güncelleme: Bugün" : "Last updated: Today"}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="border-border-subtle bg-bg-secondary/20 mt-6 rounded-xl border p-4">
          <p className="text-fg-muted mb-3 text-[10px] font-bold tracking-wider uppercase">
            {locale === "tr" ? "Öncelik Kılavuzu" : "Priority Guide"}
          </p>
          <div className="flex flex-wrap gap-4">
            {(Object.entries(PRIORITY_CONFIG) as [string, (typeof PRIORITY_CONFIG)[1]][]).map(
              ([lvl, cfg]) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[9px] font-black tracking-[0.15em] uppercase ${cfg.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
                    {locale === "tr" ? cfg.labelTR : cfg.label}
                  </span>
                  <span className="text-fg-muted text-[10px]">
                    {lvl === "1"
                      ? locale === "tr"
                        ? "— Hemen başvur"
                        : "— Apply immediately"
                      : lvl === "2"
                        ? locale === "tr"
                          ? "— Bu çeyrekte"
                          : "— This quarter"
                        : lvl === "3"
                          ? locale === "tr"
                            ? "— Sonraki çeyrek"
                            : "— Next quarter"
                          : locale === "tr"
                            ? "— Backlog"
                            : "— Backlog"}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
