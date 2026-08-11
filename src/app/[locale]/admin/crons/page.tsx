import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { CronsDashboardClient } from "@/components/admin/crons-dashboard-client";
import { CronHealthClient } from "@/components/admin/cron-health-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: _locale } = await params;
  return { title: "Cron Manager & Health | ALPAR AI Admin" };
}

export default async function CronsPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations("admin");
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className="space-y-8 rounded-3xl bg-zinc-900/40 px-3 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:px-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t("scheduled_jobs_cron_topology")} & {t("cron_health") || "Cron Sağlığı"}
        </h1>
        <p className="text-fg-muted text-sm">{t("monitor_supabase_pg_cron_jobs_execution_")}</p>
      </div>

      <CronsDashboardClient />

      <div className="border-t border-white/10 pt-6">
        <CronHealthClient jobs={[]} historyData={[]} />
      </div>
    </div>
  );
}
