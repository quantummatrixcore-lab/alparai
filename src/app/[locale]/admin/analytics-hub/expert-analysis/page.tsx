import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ExpertAnalysisBoard } from "@/components/admin/expert-analysis-board";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("expert_analysis_title", { defaultValue: "Uzman Kurulu Analizi · ALPAR AI" }) };
}

import { AnalyticsHubTabs } from "@/components/admin/analytics-hub-tabs";

export default async function ExpertAnalysisAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <AnalyticsHubTabs />
        <ExpertAnalysisBoard />
      </div>
    </div>
  );
}
