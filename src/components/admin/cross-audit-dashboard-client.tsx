"use client";

import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";
import { Shield, Activity, Cpu, AlertTriangle, FileText, Lock, Eye, Bot, Play } from "lucide-react";
import type { CrossAuditDashboardData } from "@/actions/admin/cross-audit-metrics";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CrossAuditDashboardClientProps {
  data: CrossAuditDashboardData;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];
const RISK_COLORS: Record<string, string> = {
  Minimal: "#10b981",
  "Specific Transparency": "#3b82f6",
  "High Risk": "#f59e0b",
  "Unacceptable Risk": "#ef4444",
};

interface LiveCrossAuditResult {
  truth_score: number;
  risk_level: string;
  judge_verdict: string;
  models: { name: string; stance: string; reason: string }[];
}

export function CrossAuditDashboardClient({ data }: CrossAuditDashboardClientProps) {
  const t = useTranslations("admin");
  const { overview, categoryDistribution, modelComparison, riskDistribution, trendData } = data;

  const [testInput, setTestInput] = React.useState("");
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<LiveCrossAuditResult | null>(null);

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast.error("Lütfen test için bir metin girin.");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    toast.loading("Çapraz Sorgu Simülasyonu çalışıyor...", { id: "cross-audit" });

    try {
      const res = await fetch("/api/admin/live-cross-audit", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testInput }),
        credentials: "include",
      });

      let resData;
      try {
        resData = await res.json();
      } catch (_e) {
        console.error("Ignored error:", _e);
      }

      if (!res.ok) {
        throw new Error(resData?.message || "Sunucu hatası");
      }

      setIsTesting(false);

      if (resData?.success && resData?.data) {
        toast.success("Çapraz Sorgu tamamlandı!", { id: "cross-audit" });
        setTestResult(resData.data);
      } else {
        toast.error(resData?.error || "Bir hata oluştu", { id: "cross-audit" });
      }
    } catch (_err) {
      setIsTesting(false);
      toast.error("Bir hata oluştu", { id: "cross-audit" });
    }
  };

  return (
    <div className="space-y-8">
      {/* 0. Live Test Section */}
      <div className="bg-bg-secondary/40 border-brand-500/30 relative overflow-hidden rounded-2xl border p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-xl">
        <div className="bg-brand-500/10 absolute top-0 right-0 h-64 w-64 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="text-brand-400 h-5 w-5" />
            <h2 className="text-lg font-bold text-white">
              Canlı Çapraz Sorgu (Live Cross-Audit Engine)
            </h2>
          </div>
          <p className="text-fg-muted mb-4 text-sm">
            Gerçek zamanlı olarak "Debate & Verdict" modelini test edin. Bir olay metni girin,
            farklı AI modellerinin tartışıp nasıl karar verdiğini izleyin.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <textarea
              className="bg-bg-tertiary focus:border-brand-500/50 flex-1 resize-none rounded-lg border border-white/10 p-3 text-sm text-white focus:outline-none"
              rows={3}
              placeholder="Örn: Kullanıcı hesabından izinsiz 5000 TL çekilmiş ve sistem uyarı vermemiş..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              disabled={isTesting}
            />
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="bg-brand-500 hover:bg-brand-400 flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 sm:self-end"
            >
              {isTesting ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isTesting ? "Test Ediliyor..." : "Sorgula"}
            </button>
          </div>

          {testResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 border-t border-white/10 pt-6 duration-500">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold tracking-wide text-white">
                  Değerlendirme Sonucu (Audit Verdict)
                </h3>
                <div className="flex gap-4">
                  <div className="bg-bg-tertiary/60 flex items-center gap-3 rounded-xl border border-white/5 px-4 py-2">
                    <span className="text-fg-muted text-xs font-bold uppercase">TRUTH SCORE</span>
                    <span className="font-mono text-lg font-black text-emerald-400">
                      {testResult.truth_score}/100
                    </span>
                  </div>
                  <div className="bg-bg-tertiary/60 flex items-center gap-3 rounded-xl border border-white/5 px-4 py-2">
                    <span className="text-fg-muted text-xs font-bold uppercase">RISK LEVEL</span>
                    <span
                      className={cn(
                        "rounded-lg border px-2.5 py-0.5 font-mono text-sm font-black uppercase",
                        testResult.risk_level.toLowerCase().includes("high") ||
                          testResult.risk_level.toLowerCase().includes("unacceptable")
                          ? "border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
                      )}
                    >
                      {testResult.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {testResult.models?.map((m, idx: number) => {
                  const getStanceVariant = (stance: string) => {
                    const s = stance.toLowerCase();
                    if (
                      s.includes("critical") ||
                      s.includes("unacceptable") ||
                      s.includes("high") ||
                      s.includes("danger") ||
                      s.includes("violation") ||
                      s.includes("severe")
                    ) {
                      return "danger" as const;
                    }
                    if (s.includes("warn") || s.includes("medium") || s.includes("specific")) {
                      return "warning" as const;
                    }
                    return "success" as const;
                  };

                  return (
                    <div
                      key={idx}
                      className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 group relative rounded-xl border p-4 transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-purple-500 to-cyan-500 opacity-10 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="text-brand-400 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                          {m.name}
                        </div>
                        <Badge
                          variant={getStanceVariant(m.stance)}
                          className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase"
                        >
                          {m.stance}
                        </Badge>
                      </div>
                      <p className="mb-1 text-xs leading-relaxed font-semibold text-white/90">
                        {m.stance}
                      </p>
                      <p className="text-fg-muted text-xs leading-relaxed">{m.reason}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-brand-500/10 border-brand-500/20 rounded-xl border p-4 shadow-[inset_0_0_12px_rgba(168,85,247,0.05)]">
                <h4 className="text-brand-400 mb-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                  <Shield className="h-4 w-4 text-purple-400" /> Nihai Karar (Judge Verdict)
                </h4>
                <p className="text-sm leading-relaxed text-white/90">{testResult.judge_verdict}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title={t("metrics_total_audited") || "Total Audited"}
          value={overview.totalAudited}
          icon={<FileText className="text-brand-400 h-5 w-5" />}
          description={t("metrics_total_audited_desc") || "Cross-audited incidents"}
        />
        <StatCard
          title={t("metrics_avg_truth") || "Avg Truth Score"}
          value={`${overview.averageTruthScore}/100`}
          icon={<Shield className="text-success-400 h-5 w-5" />}
          description={t("metrics_avg_truth_desc") || "Incident plausibility rating"}
          colorClass={
            overview.averageTruthScore >= 80
              ? "text-success-400"
              : overview.averageTruthScore >= 50
                ? "text-warning-400"
                : "text-danger-400"
          }
        />
        <StatCard
          title={t("metrics_avg_confidence") || "Avg Confidence"}
          value={`${Math.round(overview.averageConfidence * 100)}%`}
          icon={<Activity className="text-info-400 h-5 w-5" />}
          description={t("metrics_avg_confidence_desc") || "AI consensus strength"}
        />
        <StatCard
          title={t("metrics_avg_transparency") || "Transparency"}
          value={`${overview.averageTransparency}/100`}
          icon={<Eye className="text-brand-400 h-5 w-5" />}
          description={t("metrics_avg_transparency_desc") || "EU Act Article 52 compliance"}
          colorClass="text-brand-400"
        />
        <StatCard
          title={t("metrics_avg_ethics") || "Ethics / Non-Bias"}
          value={`${overview.averageNonDiscrimination}/100`}
          icon={<Cpu className="text-warning-400 h-5 w-5" />}
          description={t("metrics_avg_ethics_desc") || "Ethics & fairness score"}
          colorClass="text-warning-400"
        />
        <StatCard
          title={t("metrics_avg_privacy") || "Data Privacy"}
          value={`${overview.averageDataPrivacy}/100`}
          icon={<Lock className="text-danger-400 h-5 w-5" />}
          description={t("metrics_avg_privacy_desc") || "GDPR/KVKK safeguards"}
          colorClass="text-danger-400"
        />
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="font-bold tracking-tight text-white">
              {t("metrics_trend_title") || "Historical Score Evolution"}
            </h3>
            <p className="text-fg-muted mt-1 text-xs">
              {t("metrics_trend_subtitle") || "Average scores grouped by month"}
            </p>
          </div>
          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={11}
                    tickMargin={10}
                  />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10,10,10,0.9)",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="truthScore"
                    stroke="#10b981"
                    strokeWidth={2}
                    name={t("metrics_avg_truth") || "Truth Score"}
                  />
                  <Line
                    type="monotone"
                    dataKey="nonDiscrimination"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name={t("metrics_avg_ethics") || "Ethics Score"}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Model Comparison Leaderboard */}
        <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="font-bold tracking-tight text-white">
              {t("metrics_model_comparison_title") || "AI Provider Accountability Bench"}
            </h3>
            <p className="text-fg-muted mt-1 text-xs">
              {t("metrics_model_comparison_subtitle") ||
                "Average incident scores by provider (higher is better)"}
            </p>
          </div>
          <div className="h-72 w-full">
            {modelComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={modelComparison}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="providerName"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={11}
                    tickMargin={10}
                  />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10,10,10,0.9)",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="averageTruthScore"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name={t("metrics_avg_truth") || "Truth Score"}
                  />
                  <Bar
                    dataKey="averageNonDiscrimination"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name={t("metrics_avg_ethics") || "Ethics Score"}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="font-bold tracking-tight text-white">
              {t("metrics_category_distribution_title") || "Incident Categories Breakdown"}
            </h3>
            <p className="text-fg-muted mt-1 text-xs">
              {t("metrics_category_distribution_subtitle") ||
                "Volume of verified incidents by issue type"}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-around">
            <div className="h-64 w-64">
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,10,10,0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
            <div className="mt-4 space-y-2 sm:mt-0">
              {categoryDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-white">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium capitalize">
                    {t(`category_${entry.name}`) || entry.name}
                  </span>
                  <span className="text-fg-muted">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EU AI Act Risk Distribution */}
        <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-6 shadow-lg backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="font-bold tracking-tight text-white">
              {t("metrics_risk_distribution_title") || "EU AI Act Regulatory Risk Distribution"}
            </h3>
            <p className="text-fg-muted mt-1 text-xs">
              {t("metrics_risk_distribution_subtitle") ||
                "Incidents segmented by regulatory risk categories"}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center sm:flex-row sm:justify-around">
            <div className="h-64 w-64">
              {riskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#6b7280"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,10,10,0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState />
              )}
            </div>
            <div className="mt-4 space-y-2 sm:mt-0">
              {riskDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-white">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[entry.name] || "#6b7280" }}
                  />
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-fg-muted">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

function StatCard({ title, value, icon, description, colorClass = "text-white" }: StatCardProps) {
  return (
    <div className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-5 shadow-lg backdrop-blur-xl">
      <div className="text-fg-muted flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <h3 className={`mt-3 text-2xl font-bold tracking-tight ${colorClass}`}>{value}</h3>
      {description && <p className="text-fg-muted mt-1 text-[11px] font-medium">{description}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <AlertTriangle className="text-fg-muted mb-2 h-8 w-8 opacity-50" />
      <span className="text-fg-muted text-sm">No cross-audited data available yet.</span>
    </div>
  );
}
