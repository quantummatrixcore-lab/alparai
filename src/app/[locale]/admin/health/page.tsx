import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { checkSystemHealth } from "@/lib/health/system-health";
import { HealthDashboardClient } from "@/components/admin/health-dashboard-client";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";

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
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-6 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <SystemHubTabs />
        <div>
          <div>
            <h1 className="text-fg-secondaryxl flex items-center gap-2 font-bold tracking-tight text-white">
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
      </div>
    </div>
  );
}
