import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SloDashboardClient } from "@/components/admin/slo-dashboard-client";

import { MetricsHubTabs } from "@/components/admin/metrics-hub-tabs";

export default async function SloDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="animate-in fade-in space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl duration-500 sm:p-6 md:p-8">
        <MetricsHubTabs />
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
            {t("slo_dashboard_title")}
          </h1>
          <p className="text-fg-secondary mt-2">{t("slo_dashboard_subtitle")}</p>
        </div>

        <SloDashboardClient initialSlos={[]} initialDora={{}} />
      </div>
    </div>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
