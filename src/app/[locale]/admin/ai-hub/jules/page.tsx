import { requireAdmin } from "@/lib/auth/session";
import { listJulesSessions } from "@/actions/admin/jules";
import { JulesDashboard } from "@/components/admin/jules/jules-dashboard";
import { getTranslations } from "next-intl/server";

import { AiHubTabs } from "@/components/admin/ai-hub-tabs";
import { AdminContainer } from "@/components/admin/admin-design-kit";

export const dynamic = "force-dynamic";

export default async function JulesPage() {
  await requireAdmin();

  const [sessionsResult] = await Promise.all([listJulesSessions()]);

  return (
    <AdminContainer shell>
      <AiHubTabs />
      <JulesDashboard
        sessions={sessionsResult.sessions ?? []}
        connected={sessionsResult.success}
        defaultRepo="quantummatrixcore-lab/Alparai.com"
      />
    </AdminContainer>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  return {
    title: t("jules_meta_title"),
    description: t("jules_meta_desc"),
  };
}
