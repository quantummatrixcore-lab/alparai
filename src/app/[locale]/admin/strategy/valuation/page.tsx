import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdvisor } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { ValuationCalculatorClient } from "@/components/admin/strategy/valuation-calculator-client";
import { TrendingUp } from "lucide-react";
import type { StrategyValuation } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("val_title") || "Valuation Calculator"} | ALPAR AI` };
}

export default async function ValuationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Authenticate user & check advisor access
  const user = await requireAdvisor();
  const isReadOnly = (user.role as string) === "advisor";

  const supabase = await createServerClient();

  const [dataRes, swotRes, risksRes, milestonesRes, revenueRes] = await Promise.all([
    supabase.from("strategy_valuations").select("*").order("snapshot_date", { ascending: false }),
    supabase.from("strategy_swot_items").select("*", { count: "exact", head: true }),
    supabase.from("strategy_risks").select("*", { count: "exact", head: true }),
    supabase.from("strategy_milestones").select("*", { count: "exact", head: true }),
    supabase
      .from("finance_revenue_metrics")
      .select("*")
      .order("month", { ascending: false })
      .limit(1),
  ]);

  const initialValuations = (dataRes.data ?? []) as StrategyValuation[];
  const strategyCounts = {
    swot: swotRes.count ?? 0,
    risks: risksRes.count ?? 0,
    milestones: milestonesRes.count ?? 0,
  };

  const latestRevenue = revenueRes?.data?.[0];
  const revenueMetrics = {
    mrr: latestRevenue?.mrr_usd ?? 0,
    arr: latestRevenue?.arr_usd ?? 0,
    activeSubs: latestRevenue?.active_subs ?? 0,
  };

  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {t("val_title")}
              </h1>
            </div>
            <p className="text-fg-muted mt-1 text-sm">{t("val_desc")}</p>
          </div>
          {isReadOnly && (
            <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              {t("read_only")}
            </span>
          )}
        </div>

        {/* Valuation Calculator Component */}
        <ValuationCalculatorClient
          initialValuations={initialValuations}
          strategyCounts={strategyCounts}
          revenueMetrics={revenueMetrics}
          isReadOnly={isReadOnly}
          locale={locale}
        />
      </Container>
    </div>
  );
}
