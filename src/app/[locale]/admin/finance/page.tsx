export const dynamic = "force-dynamic";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";

import { requireModerator } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { CostOverviewCard } from "@/components/admin/finance/cost-overview-card";
import { BudgetGauge } from "@/components/admin/finance/budget-gauge";
const CostTrendChart = nextDynamic(() =>
  import("@/components/admin/finance/cost-trend-chart").then((m) => m.CostTrendChart),
);

import { ApiUsageTable } from "@/components/admin/finance/api-usage-table";
import { AlertBanner } from "@/components/admin/finance/alert-banner";
import { AIVelocityWidget } from "@/components/admin/ai-velocity-widget";
import type { VelocityMetric } from "@/lib/analytics/velocity-calculator";
import {
  AdminContainer,
  AdminPageHeader,
  AdminSectionCard,
  MetricCard,
  ZeroCostBanner,
} from "@/components/admin/admin-design-kit";
import { DollarSign, ShieldCheck, Zap, Sparkles, TrendingDown } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface DBMonthlyCost {
  month: string;
  service: string;
  amount_usd: number;
  budget_usd: number;
}

interface DBApiUsage {
  id: string;
  service: string;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

async function VercelLiveCostCard({
  fallbackCost,
  budgetLimit,
  trend,
  lastUpdated,
}: {
  fallbackCost: number;
  budgetLimit: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}) {
  let vercelLiveCost: number | null = null;
  const vercelToken = process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (vercelToken) {
    try {
      const res = await fetch("https://api.vercel.com/v1/billing/charges", {
        next: { revalidate: 3600 },
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.charges) {
          vercelLiveCost = (data.charges as { amount?: number }[]).reduce(
            (acc: number, curr) => acc + (curr.amount || 0),
            0,
          );
        }
      }
    } catch (e) {
      logger.error(
        "Vercel Live Cost API Fetch Failed",
        undefined,
        e instanceof Error ? e : undefined,
      );
    }
  }

  const currentCost = vercelLiveCost ?? fallbackCost;
  const percentUsed = budgetLimit > 0 ? Math.round((currentCost / budgetLimit) * 100) : 0;

  return (
    <CostOverviewCard
      name="vercel"
      currentCost={currentCost}
      budgetLimit={budgetLimit}
      percentUsed={percentUsed}
      trend={trend}
      lastUpdated={lastUpdated}
    />
  );
}

export default async function FinancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 1. Auth Gate
  await requireModerator();

  // 2. Translations
  const t = await getTranslations({ locale, namespace: "finance" });
  const tAdmin = await getTranslations({ locale, namespace: "admin" });
  const tErrors = await getTranslations({ locale, namespace: "errors" });

  // 3. Database Fetch
  const supabase = createAdminClient();

  const { data: dbCosts } = await supabase
    .from("finance_monthly_costs" as never)
    .select("*")
    .order("month", { ascending: true });

  const { data: dbUsage } = await supabase
    .from("finance_api_usage" as never)
    .select("*")
    .order("recorded_at", { ascending: false });

  const { data: dbVelocity } = await supabase
    .from("ai_velocity_metrics" as never)
    .select("*")
    .order("release_date", { ascending: false });

  const { data: dbQuotas } = await supabase
    .from("vendor_quotas" as never)
    .select("*")
    .in("vendor", ["github_actions", "vercel", "supabase", "openrouter"]);

  const costs = (dbCosts || []) as unknown as DBMonthlyCost[];
  const usage = (dbUsage || []) as unknown as DBApiUsage[];
  const velocityMetrics = (dbVelocity || []) as unknown as VelocityMetric[];
  const quotas = (dbQuotas || []) as unknown as Array<{
    vendor: string;
    metric: string;
    used_value: number | null;
    limit_value: number | null;
    unit: string | null;
    period_end: string | null;
  }>;

  // Dynamic current month calculation (e.g. "2026-08-01")
  const now = new Date();
  const dynamicCurrentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const latestMonthInDb = costs.length > 0 ? costs[costs.length - 1]?.month : null;
  const currentMonth = latestMonthInDb ?? dynamicCurrentMonth;
  const currentCosts = costs.filter((c) => c.month === currentMonth);

  // Construct Services Array with OpenCode Zero-Cost Tier Allocation
  const services = [
    {
      name: "vercel",
      currentCost: Number(currentCosts.find((c) => c.service === "vercel")?.amount_usd ?? 20.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "vercel")?.budget_usd ?? 20.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "supabase",
      currentCost: Number(currentCosts.find((c) => c.service === "supabase")?.amount_usd ?? 35.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "supabase")?.budget_usd ?? 35.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "opencode_free_tier",
      currentCost: Number(
        currentCosts.find((c) => c.service === "opencode_free_tier")?.amount_usd ?? 0.0,
      ),
      budgetLimit: Number(
        currentCosts.find((c) => c.service === "opencode_free_tier")?.budget_usd ?? 50.0,
      ),
      trend: "down" as const,
      lastUpdated: new Date().toISOString(),
    },

    {
      name: "resend",
      currentCost: Number(currentCosts.find((c) => c.service === "resend")?.amount_usd ?? 0.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "resend")?.budget_usd ?? 0.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "upstash",
      currentCost: Number(currentCosts.find((c) => c.service === "upstash")?.amount_usd ?? 0.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "upstash")?.budget_usd ?? 5.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "claude_pro",
      currentCost: Number(currentCosts.find((c) => c.service === "claude_pro")?.amount_usd ?? 20.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "claude_pro")?.budget_usd ?? 20.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "google_ultra",
      currentCost: Number(
        currentCosts.find((c) => c.service === "google_ultra")?.amount_usd ?? 30.0,
      ),
      budgetLimit: Number(
        currentCosts.find((c) => c.service === "google_ultra")?.budget_usd ?? 30.0,
      ),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "github",
      currentCost: Number(currentCosts.find((c) => c.service === "github")?.amount_usd ?? 4.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "github")?.budget_usd ?? 4.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "openrouter",
      currentCost: Number(currentCosts.find((c) => c.service === "openrouter")?.amount_usd ?? 10.0),
      budgetLimit: Number(currentCosts.find((c) => c.service === "openrouter")?.budget_usd ?? 10.0),
      trend: "stable" as const,
      lastUpdated: new Date().toISOString(),
    },
  ].map((s) => {
    const percentUsed = s.budgetLimit > 0 ? Math.round((s.currentCost / s.budgetLimit) * 100) : 0;
    return { ...s, percentUsed };
  });

  const totalMonthly = services.reduce((acc, curr) => acc + curr.currentCost, 0);
  const totalBudget = services.reduce((acc, curr) => acc + curr.budgetLimit, 0);
  const estimatedSavings = Math.max(
    0,
    services.reduce(
      (acc, curr) =>
        acc + (curr.budgetLimit > curr.currentCost ? curr.budgetLimit - curr.currentCost : 0),
      0,
    ),
  );

  // Recharts Trends Grouping
  const months = Array.from(new Set(costs.map((c) => c.month)));
  const trends =
    months.length > 0
      ? months.map((m) => {
          const monthLabel = new Date(m).toLocaleDateString(tAdmin("en_us") || "en-US", {
            month: "short",
            year: "numeric",
          });
          const monthCosts = costs.filter((c) => c.month === m);
          const dataPoint: Record<string, string | number> = { name: monthLabel };
          let sum = 0;
          monthCosts.forEach((c) => {
            const val = Number(c.amount_usd);
            dataPoint[c.service] = val;
            sum += val;
          });
          dataPoint["Total"] = sum;
          return dataPoint;
        })
      : [
          { name: "Jun 2026", Total: 0, vercel: 0, supabase: 0, opencode: 0 },
          { name: "Jul 2026", Total: 0, vercel: 0, supabase: 0, opencode: 0 },
          { name: "Aug 2026", Total: 0, vercel: 0, supabase: 0, opencode: 0 },
        ];

  let costTrendPercent = 0;
  if (trends.length >= 2) {
    const prev = Number(trends[trends.length - 2]?.Total || 0);
    const curr = Number(trends[trends.length - 1]?.Total || 0);
    if (prev > 0) {
      costTrendPercent = Math.round(((curr - prev) / prev) * 100);
    }
  }
  const costTrendLabel = `${costTrendPercent > 0 ? "+" : ""}${costTrendPercent}%`;

  // Alarms
  const alerts: string[] = [];
  services.forEach((s) => {
    if (s.percentUsed >= 90 && s.budgetLimit > 0) {
      alerts.push(
        tErrors("finance_alert_limit", {
          service: s.name.toUpperCase(),
          percent: s.percentUsed,
        }),
      );
    } else if (s.percentUsed >= 80 && s.budgetLimit > 0) {
      alerts.push(
        tErrors("finance_alert_warning", {
          service: s.name.toUpperCase(),
          percent: s.percentUsed,
        }),
      );
    }
  });

  return (
    <AdminContainer shell>
      <SystemHubTabs />
      {/* Header */}
      <AdminPageHeader
        icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
        title={t("title") || "Financial Intelligence & Cost Optimization"}
        subtitle={
          t("description") ||
          "Real-time monthly infrastructure cost tracking, budget caps, and zero-cost AI router savings."
        }
        lastUpdated={new Date().toLocaleDateString(locale)}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <Zap className="h-3.5 w-3.5" />{" "}
            {t("zero_token_cost_active") || "Zero Token Cost Active"}
          </span>
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Finance", href: "/admin/finance" },
        ]}
      />

      {/* Zero Cost Tier Banner */}
      <ZeroCostBanner
        services={services}
        totalSaved={`$${estimatedSavings.toFixed(2)}`}
        locale={locale}
      />

      {/* Alert Banner if any threshold exceeded */}
      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Monthly Cost"
          value={`$${totalMonthly.toFixed(2)}`}
          variant="success"
          icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
          tooltip="Active monthly infrastructure spending"
        />
        <MetricCard
          label="Monthly Budget Ceiling"
          value={`$${totalBudget.toFixed(2)}`}
          variant="default"
          icon={<ShieldCheck className="h-6 w-6 text-purple-400" />}
          tooltip="Combined budget caps across services"
        />
        <MetricCard
          label="Estimated Monthly Savings"
          value={`$${estimatedSavings.toFixed(2)}`}
          variant="success"
          delta={{ value: 100, isPositive: true }}
          icon={<Sparkles className="h-6 w-6 text-amber-400" />}
          tooltip="Saved via OpenCode Free-First model allocation"
        />
        <MetricCard
          label="Cost Trend"
          value={costTrendLabel}
          variant="success"
          icon={<TrendingDown className="h-6 w-6 text-cyan-400" />}
          tooltip="Zero paid API tokens spent on mechanical steps"
        />
      </div>

      {/* Service Cost Breakdown & Budget Gauge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
          {services.map((service) => {
            if (service.name === "vercel") {
              return (
                <Suspense
                  key={service.name}
                  fallback={
                    <CostOverviewCard
                      name={service.name}
                      currentCost={service.currentCost}
                      budgetLimit={service.budgetLimit}
                      percentUsed={service.percentUsed}
                      trend={service.trend}
                      lastUpdated={service.lastUpdated}
                    />
                  }
                >
                  <VercelLiveCostCard
                    fallbackCost={service.currentCost}
                    budgetLimit={service.budgetLimit}
                    trend={service.trend}
                    lastUpdated={service.lastUpdated}
                  />
                </Suspense>
              );
            }
            return (
              <CostOverviewCard
                key={service.name}
                name={service.name}
                currentCost={service.currentCost}
                budgetLimit={service.budgetLimit}
                percentUsed={service.percentUsed}
                trend={service.trend}
                lastUpdated={service.lastUpdated}
              />
            );
          })}
        </div>
        <div className="lg:col-span-1">
          <AdminSectionCard title={t("budget_allocation_gauge") || "Budget Allocation Gauge"}>
            <BudgetGauge totalMonthly={totalMonthly} totalBudget={totalBudget} />
          </AdminSectionCard>
        </div>
      </div>

      {/* Trend Chart */}
      <AdminSectionCard
        title={t("infra_provider_cost_trends") || "Infrastructure & Provider Cost Trends"}
      >
        <CostTrendChart data={trends} />
      </AdminSectionCard>

      {/* AI Velocity Engine & Projections */}
      <AIVelocityWidget initialMetrics={velocityMetrics.length > 0 ? velocityMetrics : undefined} />

      {/* Infrastructure Quota Tracking */}
      <AdminSectionCard
        title={t("platform_quota_resource_usage") || "Platform Quota & Resource Usage"}
        action={
          <a
            href={`/${locale}/admin/quotas`}
            className="text-brand-400 hover:text-brand-300 text-xs font-medium transition"
          >
            {tAdmin("view_all_quotas") || "View All Quotas"} →
          </a>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quotas.length === 0 ? (
            <div className="text-fg-tertiary col-span-full py-8 text-center text-sm">
              {tAdmin("no_quotas") || "No quotas configured"}
            </div>
          ) : (
            <>
              {["github_actions", "vercel", "supabase", "openrouter"].map((vendor) => {
                const quota = quotas.find((q) => q.vendor === vendor);
                if (!quota) return null;

                const displayUsed = quota.used_value !== null ? quota.used_value : undefined;
                const displayTotal = quota.limit_value !== null ? quota.limit_value : undefined;
                const displayUnit = quota.unit || undefined;

                const vendorLabels: Record<string, string> = {
                  github_actions: "GitHub Actions",
                  vercel: "Vercel Build Minutes",
                  supabase: "Supabase Storage",
                  openrouter: "OpenRouter Credits",
                };
                const vendorLabel = vendorLabels[vendor] || vendor;

                return (
                  <div
                    key={vendor}
                    className="border-border-secondary bg-bg-secondary rounded-lg border p-4"
                  >
                    <div className="text-fg-primary mb-3 text-sm font-medium">{vendorLabel}</div>
                    {displayUsed !== undefined && displayTotal !== undefined ? (
                      <>
                        <div className="text-fg-primary text-fg-secondaryxl mb-2 font-bold">
                          {displayUsed.toLocaleString()}{" "}
                          <span className="text-fg-tertiary text-sm">
                            / {displayTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-fg-tertiary mb-3 text-xs">
                          {displayUnit || "units"}
                        </div>
                        <div className="bg-bg-tertiary h-2 overflow-hidden rounded-full">
                          <div
                            className={`h-full transition-all ${
                              displayTotal > 0
                                ? displayUsed / displayTotal >= 0.95
                                  ? "bg-red-500"
                                  : displayUsed / displayTotal >= 0.8
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                            style={{
                              width:
                                displayTotal > 0
                                  ? `${Math.min((displayUsed / displayTotal) * 100, 100)}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <div className="text-fg-tertiary mt-2 text-xs">
                          {displayTotal > 0
                            ? `${((displayUsed / displayTotal) * 100).toFixed(1)}% used`
                            : "—"}
                        </div>
                      </>
                    ) : (
                      <div className="text-fg-secondary py-6 text-sm italic">ölçülmedi</div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </AdminSectionCard>

      {/* API Usage Metrics Table */}
      <AdminSectionCard
        title={t("api_telemetry_usage") || "Real-Time API & Gateway Telemetry Usage"}
      >
        <ApiUsageTable data={usage} />
      </AdminSectionCard>
    </AdminContainer>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
