import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ExpertAnalysisBoard } from "@/components/admin/expert-analysis-board";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("expert_analysis_title", { defaultValue: "Uzman Kurulu Analizi · ALPAR AI" }) };
}

export default async function ExpertAnalysisAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  return <ExpertAnalysisBoard />;
}
