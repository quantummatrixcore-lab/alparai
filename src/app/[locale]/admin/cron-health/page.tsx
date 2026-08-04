import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { CronHealthClient } from "@/components/admin/cron-health-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
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

  // Mock data for cron jobs
  const cronJobs = [
    { name: "ai-heartbeat", lastRun: "2 mins ago", status: "Active", executionTime: 124 },
    { name: "keep-alive", lastRun: "5 mins ago", status: "Active", executionTime: 45 },
    { name: "retro-audit", lastRun: "1 hour ago", status: "Active", executionTime: 1850 },
    { name: "k-weekly-refresh", lastRun: "2 days ago", status: "Active", executionTime: 4200 },
    { name: "k-model-retirement", lastRun: "5 days ago", status: "Degraded", executionTime: 15000 },
  ];

  // Generate fallback chart data (Execution History)
  const historyData = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeStr = `${d.getHours().toString().padStart(2, "0")}:00`;

    // Deterministic mock data
    const successCount = ((i * 3 + 7) % 5) + 12;
    const failedCount = i === 12 || i === 4 ? 2 : 0;

    historyData.push({ time: timeStr, success: successCount, failed: failedCount });
  }

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Clock className="h-7 w-7 text-sky-400" />}
        title={t("cron_health") || "Cron Job Health"}
        subtitle={"Monitor background tasks and periodic system jobs"}
      />

      <CronHealthClient jobs={cronJobs} historyData={historyData} />
    </AdminContainer>
  );
}
