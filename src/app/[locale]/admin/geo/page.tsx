import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { GeoDashboardClient } from "@/components/admin/geo-dashboard-client";
import { getGeoStatsAction, type GeoCitationRow } from "@/actions/geo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("nav_geo")} | ALPAR AI Admin` };
}

export default async function GEOPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const t = await getTranslations({ locale, namespace: "admin" });
  const stats = await getGeoStatsAction();

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-6 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("nav_geo")}</h1>
          <p className="text-fg-muted text-sm">{t("geo_ai_traffic_gauge")}</p>
        </div>

        <GeoDashboardClient
          initialScore={stats.score}
          initialCitations={stats.citations as GeoCitationRow[]}
          botHits={stats.botHits}
        />
      </div>
    </div>
  );
}
