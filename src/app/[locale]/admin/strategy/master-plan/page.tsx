import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdmin } from "@/lib/auth/session";
const MasterPlanClient = dynamic(() =>
  import("@/components/admin/master-plan-client").then((m) => m.MasterPlanClient),
);

const MasterPlanDashboard = dynamic(() =>
  import("@/components/admin/master-plan-dashboard").then((m) => m.MasterPlanDashboard),
);

const StrategyTabs = dynamic(() =>
  import("@/components/admin/strategy-tabs").then((m) => m.StrategyTabs),
);

import { parseMasterPlan } from "@/lib/server/master-plan";
import { Compass } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("master_plan") || "Master Plan"} | ALPAR AI` };
}

export default async function MasterPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  // Authenticate user & check admin access
  await requireAdmin();

  // Parse the markdown file
  const { items, error } = parseMasterPlan();

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <StrategyTabs />
        <Container>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="text-brand-400 h-6 w-6" />
                <h1 className="text-fg-secondaryxl font-extrabold tracking-tight text-white md:text-3xl">
                  {t("master_plan_title")}
                </h1>
              </div>
              <p className="text-fg-muted mt-1 text-sm">{t("master_plan_subtitle")}</p>
            </div>
          </div>

          <MasterPlanDashboard items={items} />

          <MasterPlanClient items={items} error={error} />
        </Container>
      </div>
    </div>
  );
}
