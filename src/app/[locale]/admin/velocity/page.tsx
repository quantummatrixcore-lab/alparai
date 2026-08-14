import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Cpu } from "lucide-react";

interface AIVelocityMetric {
  id: string;
  provider: string;
  model_family: string;
  benchmark_elo: number;
  capability_jump_pct: number;
  recorded_at: string;
}

interface FinancialVelocityProjection {
  id: string;
  scenario_name: string;
  b2b_demand_multiplier: number;
  projected_arr: number;
  ai_velocity_factor: number;
  created_at: string;
}

export const metadata = {
  title: "AI Velocity Engine | Admin",
};

export default async function AdminVelocityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin_velocity" });

  await requireAdmin();

  const supabase = await createClient();

  // Fetch AI Velocity Metrics
  const { data: velocityMetrics } = (await supabase
    .from("ai_velocity_metrics" as unknown as "users") // Hack to bypass TS error without "any"
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(10)) as unknown as { data: AIVelocityMetric[] | null };

  // Fetch Financial Projections
  const { data: projections } = (await supabase
    .from("financial_velocity_projections" as unknown as "users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)) as unknown as { data: FinancialVelocityProjection[] | null };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-fg-primary text-3xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted mt-2 text-sm">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* AI Velocity Metrics */}
        <div className="space-y-6">
          <div className="text-brand-400 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h2 className="text-xl font-bold">{t("metrics_title")}</h2>
          </div>
          <div className="grid gap-4">
            {velocityMetrics?.map((metric) => (
              <Card key={metric.id} className="border-border-subtle bg-bg-surface/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-500/10 text-brand-400 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-fg-primary text-sm font-bold">{metric.model_family}</p>
                      <p className="text-fg-muted text-xs">{metric.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-fg-primary text-lg font-extrabold">
                      Δ {metric.capability_jump_pct}%
                    </p>
                    <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
                      {t("elo")}: {metric.benchmark_elo}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!velocityMetrics || velocityMetrics.length === 0) && (
              <div className="border-border-subtle text-fg-muted rounded-xl border border-dashed p-8 text-center text-sm">
                No velocity metrics recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Financial Projections */}
        <div className="space-y-6">
          <div className="text-success-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-xl font-bold">{t("projections_title")}</h2>
          </div>
          <div className="grid gap-4">
            {projections?.map((proj) => (
              <Card key={proj.id} className="border-border-subtle bg-bg-surface/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-success-500/10 text-success-400 flex h-10 w-10 items-center justify-center rounded-lg">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-fg-primary text-sm font-bold">{proj.scenario_name}</p>
                      <p className="text-fg-muted text-xs">
                        {t("multiplier")}: {proj.b2b_demand_multiplier}x
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-success-400 text-lg font-extrabold">
                      ${(proj.projected_arr / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-fg-muted text-[10px] font-semibold tracking-wider uppercase">
                      {t("velocity_factor")}: {proj.ai_velocity_factor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!projections || projections.length === 0) && (
              <div className="border-border-subtle text-fg-muted rounded-xl border border-dashed p-8 text-center text-sm">
                No financial projections recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
