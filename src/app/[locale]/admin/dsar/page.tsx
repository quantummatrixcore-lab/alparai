import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { Clock, ShieldWarning, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { FileText, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";

export default async function DsarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const { data: requests, error } = await supabase
    .from("redaction_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching DSAR requests:", error);
  }

  const getSlaDaysLeft = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const deadline = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          {t("dsar_title")}
        </h1>
        <p className="text-fg-secondary mt-2">{t("dsar_subtitle")}</p>
      </div>

      {(() => {
        const pending = (requests ?? []).filter((r) => r.status === "pending");
        const urgent = (requests ?? []).filter((r) => getSlaDaysLeft(r.created_at) < 7);
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title={t("dsar_title_total")}
              value={requests?.length ?? 0}
              icon={<FileText className="h-4 w-4" />}
              trend="neutral"
              trendLabel={t("dsar_trend_sla")}
              accentColor="#a855f7"
              sparkData={(requests ?? []).slice(0, 8).map((_, i) => ({ value: i + 1 }))}
              chartType="bar"
            />
            <MetricCard
              title={t("dsar_title_pending")}
              value={pending.length}
              icon={<Clock className="h-4 w-4" />}
              trend={pending.length > 0 ? "up" : "neutral"}
              trendLabel={t("dsar_trend_awaiting")}
              accentColor="#f59e0b"
            />
            <MetricCard
              title={t("dsar_sla_urgent")}
              value={urgent.length}
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={urgent.length > 0 ? "down" : "neutral"}
              trendLabel={urgent.length > 0 ? t("dsar_trend_action") : t("dsar_trend_ontrack")}
              accentColor={urgent.length > 0 ? "#ef4444" : "#10b981"}
              badge={urgent.length > 0 ? t("dsar_badge_urgent") : t("dsar_badge_ok")}
              badgeColor={urgent.length > 0 ? "text-red-400" : "text-emerald-400"}
            />
          </div>
        );
      })()}

      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-xs text-purple-300">
        <p className="mb-1 flex items-center gap-2 text-sm font-bold">{t("dsar_box_title")}</p>
        <p className="text-[11px] leading-relaxed">{t("dsar_box_desc")}</p>
      </div>

      <div className="bg-bg-secondary/40 overflow-hidden rounded-xl border border-white/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="text-fg-muted bg-white/5 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">{t("dsar_th_target")}</th>
                <th className="px-6 py-4">{t("dsar_th_status")}</th>
                <th className="px-6 py-4">{t("dsar_th_sla")}</th>
                <th className="px-6 py-4">{t("dsar_th_submitted")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests?.map((req) => {
                const daysLeft = getSlaDaysLeft(req.created_at);
                const isCritical =
                  daysLeft <= 7 && req.status !== "completed" && req.status !== "rejected";
                const isOverdue =
                  daysLeft < 0 && req.status !== "completed" && req.status !== "rejected";

                return (
                  <tr key={req.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4 font-mono text-xs text-white">
                      {req.id.substring(0, 8)}...
                      <br />
                      <span className="text-fg-muted">
                        {req.reason ||
                          `${t("dsar_incident_prefix")} ${req.incident_id.substring(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {req.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                          <CheckCircle weight="fill" /> {t("dsar_completed")}
                        </span>
                      ) : req.status === "rejected" ? (
                        <span className="bg-fg-muted/10 text-fg-muted inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          {t("dsar_rejected")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">
                          <Clock weight="fill" /> {req.status || t("dsar_pending")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {req.status === "completed" || req.status === "rejected" ? (
                        <span className="text-fg-muted">—</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-sm font-bold ${
                            isOverdue
                              ? "text-rose-400"
                              : isCritical
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }`}
                        >
                          {isOverdue && <ShieldWarning weight="fill" className="animate-pulse" />}
                          {t("dsar_days", { count: daysLeft })}
                        </span>
                      )}
                    </td>
                    <td className="text-fg-muted px-6 py-4 font-mono text-xs">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-fg-muted px-6 py-8 text-center italic">
                    {t("dsar_empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
