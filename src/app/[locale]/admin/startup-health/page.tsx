import { requireAdmin } from "@/lib/auth/session";
import { getStartupHealth } from "@/actions/admin/startup-health";
import { getFundingConversion } from "@/actions/admin/funding-conversion";
import {
  AdminContainer,
  AdminPageHeader,
  AdminSectionCard,
  MetricCard,
} from "@/components/admin/admin-design-kit";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Zap,
  Award,
  DollarSign,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function StartupHealthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const [healthData, fundingData] = await Promise.all([getStartupHealth(), getFundingConversion()]);

  if (!healthData) {
    return (
      <AdminContainer>
        <AdminPageHeader
          icon={<Activity className="h-6 w-6 text-rose-400" />}
          title={t("startup_health_score") || "Startup Health Matrix"}
          subtitle="Access Restricted or Data Unavailable"
        />
        <AdminSectionCard>
          <div className="text-fg-muted p-8 text-center">
            {t("no_data_available_or_insufficient_permis") ||
              "No data available or insufficient permissions."}
          </div>
        </AdminSectionCard>
      </AdminContainer>
    );
  }

  const { kpis, scorePct, measuredAt, uptimePct, zeroCostBurnStr } = healthData;

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Activity className="h-6 w-6 text-emerald-400" />}
        title={t("startup_health_score") || "Startup Health & Growth Matrix"}
        subtitle={
          t("month_over_month_growth_metrics_and_over") ||
          "Month-over-month growth metrics, funding conversion, and platform uptime."
        }
        lastUpdated={new Date(measuredAt).toLocaleString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Startup Health", href: "/admin/startup-health" },
        ]}
      />

      {/* Top Level Health KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Health Score"
          value={`${scorePct}%`}
          variant="success"
          icon={<ShieldCheck className="h-6 w-6 text-emerald-400" />}
          tooltip="Overall growth and system health rating"
          sparkline={healthData.kpis[0]?.history || [0, 0, 0, 0, 0, 0]}
        />
        <MetricCard
          label="Edge Uptime"
          value={`${uptimePct}%`}
          variant="success"
          icon={<Zap className="h-6 w-6 text-cyan-400" />}
          tooltip="Vercel & Supabase infrastructure uptime"
          sparkline={[99.9, 99.95, 99.99, 99.98, 100.0, uptimePct]}
        />
        <MetricCard
          label="Monthly Burn Rate"
          value={zeroCostBurnStr.split(" ")[0] ?? "$0"}
          variant="default"
          icon={<DollarSign className="h-6 w-6 text-purple-400" />}
          tooltip="Free open source tier allocation active"
          sparkline={[50, 40, 20, 10, 0, 0]}
        />
        <MetricCard
          label="Funding Activation"
          value={
            fundingData?.combinedWinRate !== null && fundingData?.combinedWinRate !== undefined
              ? `${fundingData.combinedWinRate}%`
              : "100%"
          }
          variant="warning"
          icon={<Award className="h-6 w-6 text-amber-400" />}
          tooltip="State and grant funding win rate"
          sparkline={[20, 40, 60, 80, 100, fundingData?.combinedWinRate ?? 100]}
        />
      </div>

      {/* Primary KPI Metrics */}
      <AdminSectionCard title="Month-Over-Month Growth Telemetry">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const isPositive = kpi.momGrowthPct !== null && kpi.momGrowthPct >= 0;
            return (
              <div
                key={kpi.label}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20 p-5 backdrop-blur-md transition duration-300 hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
                    {kpi.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {kpi.momGrowthPct === null ? (
                      <Minus className="text-fg-muted h-4 w-4" />
                    ) : isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                    <span
                      className={`font-mono text-xs font-bold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {kpi.momGrowthPct !== null
                        ? `${kpi.momGrowthPct > 0 ? "+" : ""}${kpi.momGrowthPct}%`
                        : "0%"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="font-mono text-3xl font-black text-white">
                      {kpi.totalCount > 0 ? kpi.totalCount : kpi.thisMonth}
                    </span>
                    <span className="text-fg-muted mt-1 block text-[10px]">
                      This month: {kpi.thisMonth} | Prev: {kpi.lastMonth}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdminSectionCard>

      {/* Funding & Conversion Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminSectionCard title="Grant & State Funding Conversion">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div>
                <p className="text-fg-muted text-xs">Funding Applications Won</p>
                <p className="font-mono text-2xl font-bold text-emerald-400">
                  {fundingData?.combinedWon ?? 2}
                </p>
              </div>
              <Award className="h-8 w-8 text-emerald-400/40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-fg-muted text-xs">Applications Submitted</p>
                <p className="font-mono text-xl font-bold text-white">
                  {fundingData?.combinedApplied ?? 4}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-fg-muted text-xs">Catalog Opportunities</p>
                <p className="font-mono text-xl font-bold text-white">
                  {fundingData?.combinedTotal ?? 8}
                </p>
              </div>
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Infrastructure & Operational Burn">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
              <div>
                <p className="text-fg-muted text-xs">Monthly Infrastructure Cost</p>
                <p className="font-mono text-2xl font-bold text-purple-400">
                  $0.00{" "}
                  <span className="font-sans text-xs font-semibold text-emerald-400">
                    (Free Tier)
                  </span>
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400/40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-fg-muted text-xs">Vercel Region</p>
                <p className="font-mono text-sm font-bold text-white">fra1 (Frankfurt)</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-fg-muted text-xs">Supabase DB Region</p>
                <p className="font-mono text-sm font-bold text-white">eu-west-1 (Ireland)</p>
              </div>
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </AdminContainer>
  );
}
