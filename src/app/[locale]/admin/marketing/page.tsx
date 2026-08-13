import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { TrendingUp, Globe, Users } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { createAdminClient } from "@/lib/supabase/admin";
import { MarketingHubTabs } from "@/components/admin/marketing-hub-tabs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("nav_marketing")} | ALPAR AI Admin` };
}

export default async function MarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = createAdminClient();

  const { count: startCount } = await supabase
    .from("funnel_events")
    .select("*", { count: "exact", head: true })
    .eq("event_name", "submit_start");

  const { count: completeCount } = await supabase
    .from("funnel_events")
    .select("*", { count: "exact", head: true })
    .eq("event_name", "submit_complete");

  const { count: outreachCount } = await supabase
    .from("outreach_queue")
    .select("*", { count: "exact", head: true });

  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const funnelStart = startCount ?? 0;
  const funnelComplete = completeCount ?? 0;
  const conversionRate = funnelStart > 0 ? Math.round((funnelComplete / funnelStart) * 100) : 0;

  const { data: visits } = await supabase
    .from("funnel_events")
    .select("metadata")
    .eq("event_name", "visit");

  const sourceCounts = (visits ?? []).reduce(
    (acc, curr) => {
      const source = (curr.metadata as Record<string, unknown> | null)?.source as string;
      if (source) {
        acc[source] = (acc[source] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const sourcesList = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalVisits = visits?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <MarketingHubTabs />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("nav_marketing")}</h1>
          <p className="text-fg-muted mt-1 text-sm">{t("marketing_subtitle")}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            title="Site Visits (Referrals)"
            value={totalVisits.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            trend="neutral"
            trendLabel="Total Tracked"
            accentColor="#ec4899"
          />
          <MetricCard
            title="Funnel: Ziyaret -> Başlama"
            value={funnelStart.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            trend="neutral"
            trendLabel="Forma girenler"
            accentColor="#3b82f6"
          />
          <MetricCard
            title={t("marketing_funnel")}
            value={funnelComplete.toLocaleString()}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={conversionRate >= 50 ? "up" : "down"}
            trendLabel={`%${conversionRate} Dönüşüm`}
            accentColor="#6366f1"
            badge={conversionRate > 0 ? `%${conversionRate}` : undefined}
            badgeColor={conversionRate >= 50 ? "text-emerald-400" : "text-amber-400"}
          />
          <MetricCard
            title={t("marketing_organic")}
            value={(outreachCount ?? 0).toLocaleString()}
            icon={<Globe className="h-4 w-4" />}
            trend="neutral"
            trendLabel="Outreach Campaigns Queued"
            accentColor="#f59e0b"
          />
          <MetricCard
            title={t("marketing_activated")}
            value={(usersCount ?? 0).toLocaleString()}
            icon={<Users className="h-4 w-4" />}
            trend="up"
            trendLabel="Registered Accounts"
            accentColor="#10b981"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Top Referring Sources</h3>
            {sourcesList.length > 0 ? (
              <div className="space-y-4">
                {sourcesList.map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-fg-muted font-medium capitalize">
                      {source.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{count}</span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="bg-brand-500 h-full rounded-full"
                          style={{ width: `${Math.min((count / totalVisits) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="mb-3 h-8 w-8 text-white/20" />
                <p className="text-fg-muted text-sm">No referral data tracked yet.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-16 text-center">
            <TrendingUp className="text-brand-400 mb-3 h-10 w-10" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-white">
              {t("real_time_marketing_analytics_active")}
            </h3>
            <p className="text-fg-muted mt-1 max-w-md text-xs">
              {t("cataloged_incident_reports_outreach_queu")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
