import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { CronHealthClient } from "@/components/admin/cron-health-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isWired = false;
  if (isWired) await fetch("/api/placeholder");
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("cron_health") || "Cron Health" };
}

export default async function CronHealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/cron-health`);

  const userRole = user.role as string;
  if (
    userRole !== "moderator" &&
    userRole !== "admin" &&
    userRole !== "ceo" &&
    userRole !== "advisor"
  ) {
    redirect(`/${locale}`);
  }

  // Cron jobs (to be fetched from database)
  const cronJobs: Array<{ name: string; lastRun: string; status: string; executionTime: number }> =
    [];

  // Execution History (to be fetched from database)
  const historyData: Array<{ time: string; success: number; failed: number }> = [];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="rounded-3xl bg-zinc-900/40 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:p-8">
          <AdminContainer>
            <AdminPageHeader
              icon={<Clock className="h-7 w-7 text-sky-400" />}
              title={t("cron_health") || "Cron Job Health"}
              subtitle={"Monitor background tasks and periodic system jobs"}
            />

            <CronHealthClient jobs={cronJobs} historyData={historyData} />
          </AdminContainer>
        </div>
      </div>
    </div>
  );
}
