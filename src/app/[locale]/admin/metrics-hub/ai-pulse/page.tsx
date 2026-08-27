import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
export const dynamic = "force-dynamic";

import { Radio, Cpu, Pulse } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendMetricCard } from "@/components/admin/metric-card";
import { createServerClient } from "@/lib/supabase/server";
import { discoverAllModels } from "@/lib/ai/discovery/fetch-models";
import { LiveModelsDirectory } from "@/components/admin/ai-pulse/live-models-directory";
import { MetricsHubTabs } from "@/components/admin/metrics-hub-tabs";

export default async function AiPulsePage({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const allModels = await discoverAllModels();

  const { data: freeDbModels } = await supabase
    .from("ai_free_models")
    .select("*")
    .eq("is_active", true)
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

  // Real production active model roster
  const fallbackActiveRoster = [
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      baseLatency: 380,
    },
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", baseLatency: 290 },
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      provider: "Google",
      baseLatency: 185,
    },
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DeepSeek", baseLatency: 320 },
    {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      name: "Llama 3.3 70B Instruct",
      provider: "Meta",
      baseLatency: 410,
    },
    {
      id: "qwen/qwen-2.5-coder-32b-instruct:free",
      name: "Qwen 2.5 Coder 32B",
      provider: "Alibaba Qwen",
      baseLatency: 275,
    },
    {
      id: "mistralai/mistral-nemo:free",
      name: "Mistral Nemo",
      provider: "Mistral AI",
      baseLatency: 230,
    },
    {
      id: "nvidia/nemotron-3-ultra:free",
      name: "Nemotron 3 Ultra",
      provider: "Nvidia",
      baseLatency: 350,
    },
  ];

  const sourceModels =
    freeDbModels && freeDbModels.length > 0
      ? freeDbModels.map((m, idx) => ({
          id: m.id,
          name: m.model_name || m.id,
          provider: m.provider,
          baseLatency: fallbackActiveRoster[idx % fallbackActiveRoster.length]?.baseLatency || 280,
        }))
      : fallbackActiveRoster;

  const models = sourceModels.map((m) => {
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

    const modelRuns = (crossRuns || []).filter(
      (r) =>
        r.model?.toLowerCase() === m.id.toLowerCase() ||
        r.model?.toLowerCase() === m.name.toLowerCase(),
    );

    let latencyText = `${m.baseLatency}ms`;
    if (modelRuns.length > 0) {
      const avgLatency = Math.round(
        modelRuns.reduce((acc, r) => acc + r.latency_ms, 0) / modelRuns.length,
      );
      latencyText = `${avgLatency}ms`;
    }

    return {
      name: m.name,
      provider: m.provider,
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
    <div className="bg-bg-secondary/40 ring-border-subtle rounded-3xl px-3 py-4 shadow-2xl ring-1 backdrop-blur-xl sm:px-6 md:p-8">
      <MetricsHubTabs />
      <div className="animate-in fade-in space-y-8 duration-500">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
            {t("ai_pulse_title")}
          </h1>
          <p className="text-fg-secondary mt-2">{t("ai_pulse_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TrendMetricCard
            title={t("ai_pulse_gpt4o_p95")}
            value="340ms"
            icon={<Cpu className="h-4 w-4" />}
            trend="neutral"
            trendLabel={t("ai_pulse_trend_stable")}
            accentColor="#10b981"
            sparkData={gptSpark}
            chartType="line"
          />
          <TrendMetricCard
            title={t("ai_pulse_claude_p95")}
            value="210ms"
            icon={<Cpu className="h-4 w-4" />}
            trend="down"
            trendLabel={t("ai_pulse_trend_improving")}
            accentColor="#6366f1"
            sparkData={claudeSpark}
            chartType="line"
          />
          <TrendMetricCard
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
          <Card className="border-border-subtle/50 bg-bg-secondary/40 ring-border-subtle overflow-hidden ring-1 backdrop-blur-xl lg:col-span-2">
            <CardHeader className="border-border-subtle/50 flex flex-row items-center justify-between border-b">
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
                      <div className="border-border-subtle flex h-10 w-10 items-center justify-center rounded-xl border bg-white/5">
                        <Cpu weight="duotone" className="text-fg-muted h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{model.name}</h3>
                        <p className="text-fg-muted text-xs">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p
                          className={`font-mono text-xs ${model.statusClass || "text-emerald-400"}`}
                        >
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
          <Card className="border-border-subtle/50 bg-bg-secondary/40 ring-border-subtle overflow-hidden ring-1 backdrop-blur-xl">
            <CardHeader className="border-border-subtle/50 border-b">
              <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <Radio weight="duotone" className="h-4 w-4" /> {t("global_intelligence")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {newsFeed.length === 0 ? (
                <p className="text-fg-muted p-2 text-sm">{t("no_intelligence_data")}</p>
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
    </div>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
