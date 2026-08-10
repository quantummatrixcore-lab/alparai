import { requireAdmin } from "@/lib/auth/session";
import { listJulesSessions } from "@/actions/admin/jules";
import { JulesDashboard } from "@/components/admin/jules/jules-dashboard";
import { getTranslations } from "next-intl/server";

import { AiHubTabs } from "@/components/admin/ai-hub-tabs";

export const dynamic = "force-dynamic";

export default async function JulesPage() {
  await requireAdmin();

  const [sessionsResult] = await Promise.all([listJulesSessions()]);

  return (
    <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:p-8">
      <AiHubTabs />
      <JulesDashboard
        sessions={sessionsResult.sessions ?? []}
        connected={sessionsResult.success}
        defaultRepo="quantummatrixcore-lab/Alparai.com"
      />
    </div>
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
