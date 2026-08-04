import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { TrendingUp, DollarSign, Clock } from "lucide-react";
import { InvestorApplicationsList } from "@/components/admin/investor-applications-list";
import type { InvestorApplicationItem } from "@/components/admin/investor-applications-list";
import { logger } from "@/lib/utils/logger";
import { MetricCard } from "@/components/admin/metric-card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("investors_title") };
}

export default async function AdminInvestorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/investors`);

  // Gate check: only admins and CEO can access the investor management dashboard
  if (user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("investor_applications")
    .select(
      "id, full_name, title, company, linkedin_url, email, check_size, why_interested, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(
      "[AdminInvestorsPage] Failed to fetch investor applications",
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  const applications = (data as unknown as InvestorApplicationItem[]) ?? [];

  const approved = applications.filter((a) => a.status === "approved");
  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <Container className="py-10">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title={t("investors_title_apps")}
          value={applications.length}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          trendLabel="Pipeline"
          accentColor="#10b981"
          sparkData={applications.slice(0, 8).map((_, i) => ({ value: i + 1 }))}
          chartType="bar"
        />
        <MetricCard
          title={t("investors_title_approved")}
          value={approved.length}
          icon={<DollarSign className="h-4 w-4" />}
          trend={approved.length > 0 ? "up" : "neutral"}
          trendLabel="High intent"
          accentColor="#f59e0b"
        />
        <MetricCard
          title={t("investors_title_pending")}
          value={pendingApps.length}
          icon={<Clock className="h-4 w-4" />}
          trend={pendingApps.length > 0 ? "up" : "neutral"}
          trendLabel="Awaiting contact"
          accentColor="#6366f1"
        />
      </div>
      <header className="mb-6">
        <h1 className="text-fg-primary inline-flex items-center gap-2 text-2xl font-bold">
          <TrendingUp className="h-6 w-6 text-emerald-400" /> {t("investors_heading")}
        </h1>
        <p className="text-fg-muted mt-1 text-sm">{t("investors_desc")}</p>
      </header>

      <InvestorApplicationsList applications={applications} />
    </Container>
  );
}
