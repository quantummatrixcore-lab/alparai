import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SloDashboardClient } from "@/components/admin/slo-dashboard-client";

import { MetricsHubTabs } from "@/components/admin/metrics-hub-tabs";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

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
    <AdminContainer shell>
      <MetricsHubTabs />
      <AdminPageHeader title={t("slo_dashboard_title")} subtitle={t("slo_dashboard_subtitle")} />

        <SloDashboardClient initialSlos={[]} initialDora={{}} />
    </AdminContainer>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
