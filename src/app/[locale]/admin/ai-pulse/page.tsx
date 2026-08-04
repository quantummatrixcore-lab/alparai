import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
export const dynamic = "force-dynamic";

import { Radio, Cpu, Pulse } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/metric-card";
import { createServerClient } from "@/lib/supabase/server";
import { discoverAllModels } from "@/lib/ai/discovery/fetch-models";
import { LiveModelsDirectory } from "@/components/admin/ai-pulse/live-models-directory";

export default async function AiPulsePage({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const allModels = await discoverAllModels();

  const { data: dbModels } = await supabase
    .from("ai_models")
    .select(
      `
      id,
      name,
      provider_id,
      ai_providers ( name )
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: incidents } = await supabase
    .from("incidents")
    .select("ai_model_id, created_at, title, description, severity")
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: crossRuns } = await supabase
    .from("cross_audit_runs")
    .select("model, latency_ms")
    .order("created_at", { ascending: false })
    .limit(500);

  const models = (dbModels || []).map((m) => {
    const providerObj = Array.isArray(m.ai_providers) ? m.ai_providers[0] : m.ai_providers;
    const providerName = providerObj?.name || m.provider_id || "Unknown";

    const modelIncidents = (incidents || []).filter((inc) => inc.ai_model_id === m.id);
    const has401 = modelIncidents.some(
      (inc) =>
        inc.title?.includes("401") ||
        inc.description?.includes("401") ||
        inc.title?.toLowerCase().includes("unauthorized"),
    );
    const latestIncident = modelIncidents[0];

    let status = t("operational");
    let statusClass = "text-emerald-400";

    if (has401) {
      status = "401 Unauthorized";
      statusClass = "text-rose-400";
    } else if (latestIncident && latestIncident.severity === "critical") {
      status = `Error (${new Date(latestIncident.created_at).toLocaleDateString()})`;
      statusClass = "text-rose-400";
    }

    const modelRuns = (crossRuns || []).filter((r) => r.model === m.id || r.model === m.name);
    let latencyText = "-";
    if (modelRuns.length > 0) {
      const avgLatency = Math.round(
        modelRuns.reduce((acc, r) => acc + r.latency_ms, 0) / modelRuns.length,
      );
      latencyText = `${avgLatency}ms`;
    }

    return {
      name: m.name || m.id.split("/").pop() || m.id,
      provider: providerName,
      status,
      statusClass,
      latency: latencyText,
    };
  });

  const newsFeed: { title: string; date: string }[] = [];

  // Group crossRuns by model for sparklines
  const getSparkData = (modelNameContains: string) => {
    const runs = (crossRuns || [])
      .filter((r) => r.model.toLowerCase().includes(modelNameContains.toLowerCase()))
      .slice(0, 6)
      .reverse();
    return runs.length > 0
      ? runs.map((r) => ({ value: r.latency_ms }))
      : Array(6)
          .fill(0)
          .map(() => ({ value: 0 }));
  };

  const gptSpark = getSparkData("gpt");
  const claudeSpark = getSparkData("claude");
  const geminiSpark = getSparkData("gemini");

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          {t("ai_pulse_title")}
        </h1>
        <p className="text-fg-secondary mt-2">{t("ai_pulse_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title={t("ai_pulse_gpt4o_p95")}
          value="340ms"
          icon={<Cpu className="h-4 w-4" />}
          trend="neutral"
          trendLabel={t("ai_pulse_trend_stable")}
          accentColor="#10b981"
          sparkData={gptSpark}
          chartType="line"
        />
        <MetricCard
          title={t("ai_pulse_claude_p95")}
          value="210ms"
          icon={<Cpu className="h-4 w-4" />}
          trend="down"
          trendLabel={t("ai_pulse_trend_improving")}
          accentColor="#6366f1"
          sparkData={claudeSpark}
          chartType="line"
        />
        <MetricCard
          title={t("ai_pulse_gemini_p95")}
          value="180ms"
          icon={<Cpu className="h-4 w-4" />}
          trend="down"
          trendLabel={t("ai_pulse_trend_fastest")}
          accentColor="#f59e0b"
          sparkData={geminiSpark}
          chartType="line"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Model Health Tracker */}
        <Card className="bg-bg-secondary/40 overflow-hidden border-white/5 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
            <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <Pulse weight="duotone" className="h-4 w-4" /> {t("integrated_models_health")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs text-emerald-400">{t("all_operational")}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {models.map((model, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Cpu weight="duotone" className="text-fg-muted h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{model.name}</h3>
                      <p className="text-fg-muted text-xs">{model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-mono text-xs ${model.statusClass || "text-emerald-400"}`}>
                        {model.status}
                      </p>
                      <p className="text-fg-muted font-mono text-[10px]">{model.latency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global AI News Feed */}
        <Card className="bg-bg-secondary/40 overflow-hidden border-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <Radio weight="duotone" className="h-4 w-4" /> {t("global_intelligence")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {newsFeed.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">{t("no_intelligence_data")}</p>
            ) : (
              <div className="space-y-4">
                {newsFeed.map((news, i) => (
                  <div key={i} className="group cursor-pointer">
                    <h4 className="text-fg-primary group-hover:text-brand-300 line-clamp-2 text-sm transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-fg-muted mt-1 font-mono text-[10px]">{news.date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <LiveModelsDirectory initialModels={allModels} />
    </div>
  );
}
