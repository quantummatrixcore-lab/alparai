import { getTranslations, setRequestLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: `${t("legal_title")} | ALPAR AI`,
    description: t("legal_desc"),
  };
}

type TakedownData = {
  id: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  sla_due_at: string | null;
};

type CeaseAndDesistData = {
  id: string;
  threat_level: string;
  legal_text: string | null;
  our_response: string | null;
  published_at: string | null;
};

export default async function LegalDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const admin = createAdminClient();

  const [takedownsRes, cndRes] = await Promise.all([
    admin.from("takedown_requests").select("id, status, created_at, reviewed_at, sla_due_at"),
    admin
      .from("cease_and_desist_logs")
      .select("id, threat_level, legal_text, our_response, published_at"),
  ]);

  const takedowns = (takedownsRes.data as TakedownData[]) || [];
  const cndLogs = (cndRes.data as CeaseAndDesistData[]) || [];

  if (takedowns.length === 0 && cndLogs.length === 0) {
    return (
      <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-6 pb-20 md:pt-10">
        <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="border-border-primary/40 mb-12 border-b pb-8">
            <h1 className="from-fg-primary to-fg-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
              {t("legal_title")}
            </h1>
            <p className="text-fg-secondary text-sm">{t("legal_desc")}</p>
          </div>
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6 text-center">
              <div className="text-fg-secondary mb-1 text-sm">{t("takedown_volume_by_status")}</div>
              <div className="text-fg-primary text-3xl font-bold">0</div>
            </div>
            <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6 text-center">
              <div className="text-fg-secondary mb-1 text-sm">{t("median_review_time")}</div>
              <div className="text-fg-primary text-3xl font-bold">{t("na")}</div>
            </div>
            <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6 text-center">
              <div className="text-fg-secondary mb-1 text-sm">{t("sla_compliance")}</div>
              <div className="text-fg-primary text-3xl font-bold">{t("na")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Takedown Aggregations
  const statusCounts = takedowns.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const reviewTimes = takedowns
    .filter((t) => t.reviewed_at)
    .map((t) => new Date(t.reviewed_at!).getTime() - new Date(t.created_at).getTime())
    .sort((a, b) => a - b);

  let medianTimeText = t("na");
  if (reviewTimes.length > 0) {
    const mid = Math.floor(reviewTimes.length / 2);
    const medianMs =
      reviewTimes.length % 2 !== 0
        ? (reviewTimes[mid] ?? 0)
        : ((reviewTimes[mid - 1] ?? 0) + (reviewTimes[mid] ?? 0)) / 2;

    const hours = (medianMs ?? 0) / (1000 * 60 * 60);
    if (hours < 24) {
      medianTimeText = `${hours.toFixed(1)} ${t("hours")}`;
    } else {
      medianTimeText = `${(hours / 24).toFixed(1)} ${t("days")}`;
    }
  }

  const resolvedTakedowns = takedowns.filter((t) => t.reviewed_at && t.sla_due_at);
  let slaShareText = t("na");
  if (resolvedTakedowns.length > 0) {
    const withinSla = resolvedTakedowns.filter(
      (t) => new Date(t.reviewed_at!) <= new Date(t.sla_due_at!),
    );
    slaShareText = `${Math.round((withinSla.length / resolvedTakedowns.length) * 100)}%`;
  }

  // C&D Aggregations
  const threatLevels = cndLogs.reduce(
    (acc, curr) => {
      acc[curr.threat_level] = (acc[curr.threat_level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const publishedCnd = cndLogs.filter((c) => c.published_at !== null && c.legal_text);

  const statusMap: Record<string, string> = {
    pending: t("status_pending"),
    resolved: t("status_resolved"),
    rejected: t("status_rejected"),
  };

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-6 pb-20 md:pt-10">
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="border-border-primary/40 mb-12 border-b pb-8">
          <h1 className="from-fg-primary to-fg-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            {t("legal_title")}
          </h1>
          <p className="text-fg-secondary text-sm">{t("legal_desc")}</p>
        </div>

        {/* Aggregates Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6">
            <h3 className="text-fg-secondary mb-4 text-sm font-semibold tracking-wider uppercase">
              {t("takedown_volume_by_status")}
            </h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-fg-primary capitalize">
                    {statusMap[status.toLowerCase()] || status}
                  </span>
                  <span className="text-fg-primary bg-bg-secondary/50 rounded px-2 py-1 font-bold">
                    {count}
                  </span>
                </div>
              ))}
              {Object.keys(statusCounts).length === 0 && (
                <span className="text-fg-secondary">0</span>
              )}
            </div>
          </div>
          <div className="bg-bg-secondary/20 border-border-primary/30 flex flex-col justify-center rounded-2xl border p-6">
            <h3 className="text-fg-secondary mb-2 text-sm font-semibold tracking-wider uppercase">
              {t("median_review_time")}
            </h3>
            <div className="text-fg-primary text-4xl font-bold">{medianTimeText}</div>
          </div>
          <div className="bg-bg-secondary/20 border-border-primary/30 flex flex-col justify-center rounded-2xl border p-6">
            <h3 className="text-fg-secondary mb-2 text-sm font-semibold tracking-wider uppercase">
              {t("sla_compliance")}
            </h3>
            <div className="text-fg-primary text-4xl font-bold">{slaShareText}</div>
          </div>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6">
            <h3 className="text-fg-secondary mb-4 text-sm font-semibold tracking-wider uppercase">
              {t("cnd_threat_levels")}
            </h3>
            <div className="space-y-3">
              {Object.entries(threatLevels).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-fg-primary capitalize">{level.replace(/_/g, " ")}</span>
                  <span className="text-fg-primary bg-bg-secondary/50 rounded px-2 py-1 font-bold">
                    {count}
                  </span>
                </div>
              ))}
              {Object.keys(threatLevels).length === 0 && (
                <span className="text-fg-secondary">0</span>
              )}
            </div>
          </div>
        </div>

        {publishedCnd.length > 0 && (
          <div>
            <h3 className="text-fg-primary mb-6 text-xl font-bold">{t("recent_cnd")}</h3>
            <div className="space-y-6">
              {publishedCnd.map((cnd) => (
                <div
                  key={cnd.id}
                  className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6"
                >
                  <div className="mb-4">
                    <span className="text-accent-soft bg-accent-soft/10 mb-2 inline-block rounded px-2 py-1 text-xs font-semibold tracking-wider uppercase">
                      {cnd.threat_level.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-fg-secondary mb-1 text-sm tracking-wider uppercase">
                      Legal Text
                    </h4>
                    <p className="text-fg-primary border-border-primary/50 border-l-2 pl-4 italic">
                      {cnd.legal_text}
                    </p>
                  </div>
                  {cnd.our_response && (
                    <div>
                      <h4 className="text-fg-secondary mb-1 text-sm tracking-wider uppercase">
                        Our Response
                      </h4>
                      <p className="text-fg-primary">{cnd.our_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
