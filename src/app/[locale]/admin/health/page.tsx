import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { checkSystemHealth } from "@/lib/health/system-health";
import { HealthDashboardClient } from "@/components/admin/health-dashboard-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("nav_systemHealth")} | ALPAR AI Admin` };
}

export default async function HealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const initialReport = await checkSystemHealth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
          {t("nav_systemHealth")}
        </h1>
        <p className="text-fg-muted mt-1 text-sm">{t("health_system_desc")}</p>
      </div>

      <HealthDashboardClient initialReport={initialReport} />
    </div>
  );
}
