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
    <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:p-8">
      <AnalyticsHubTabs />
      <ExpertAnalysisBoard />
    </div>
  );
}
