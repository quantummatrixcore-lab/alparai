import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { GeoDashboardClient } from "@/components/admin/geo-dashboard-client";
import { getGeoStatsAction, type GeoCitationRow } from "@/actions/geo";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

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
    <AdminContainer shell>
      <AdminPageHeader title={t("nav_geo")} subtitle={t("geo_ai_traffic_gauge")} />

      <GeoDashboardClient
        initialScore={stats.score}
        initialCitations={stats.citations as GeoCitationRow[]}
        botHits={stats.botHits}
      />
    </AdminContainer>
  );
}
