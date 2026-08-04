import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdmin } from "@/lib/auth/session";
import { MasterPlanClient } from "@/components/admin/master-plan-client";
import { parseMasterPlan } from "@/lib/utils/markdown-parser";
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
    <div className="min-h-screen py-8">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="text-brand-400 h-6 w-6" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {t("master_plan_title")}
              </h1>
            </div>
            <p className="text-fg-muted mt-1 text-sm">{t("master_plan_subtitle")}</p>
          </div>
        </div>

        <MasterPlanClient items={items} error={error} />
      </Container>
    </div>
  );
}
