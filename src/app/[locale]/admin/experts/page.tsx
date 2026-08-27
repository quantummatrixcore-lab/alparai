import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { Award, CheckCircle2, Clock } from "lucide-react";
import { ExpertApplicationsList } from "@/components/admin/expert-applications-list";
import type { ExpertApplicationItem } from "@/components/admin/expert-applications-list";
import { TrendMetricCard } from "@/components/admin/metric-card";
import { FundingHubTabs } from "@/components/admin/funding-hub-tabs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("expertApplicationsTitle", { defaultValue: "Expert Applications" }) };
}

export default async function AdminExpertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/experts`);
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("expert_applications")
    .select(
      "id, name, email, title_institution, expertise, expertise_area, linkedin_url, status, created_at",
    )
    .order("created_at", { ascending: false });

  const applications = (data as unknown as ExpertApplicationItem[]) ?? [];

  const approved = applications.filter((a) => a.status === "approved");
  const pending = applications.filter((a) => a.status === "pending");

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <FundingHubTabs />
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TrendMetricCard
            title={t("experts_title_apps")}
            value={applications.length}
            icon={<Award className="h-4 w-4" />}
            trend="up"
            trendLabel={t("experts_trend_total")}
            accentColor="#f59e0b"
            sparkData={applications.slice(0, 8).map((_, i) => ({ value: i + 1 }))}
            chartType="bar"
          />
          <TrendMetricCard
            title={t("experts_title_approved")}
            value={approved.length}
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend={approved.length > 0 ? "up" : "neutral"}
            trendLabel={t("experts_trend_verified")}
            accentColor="#10b981"
          />
          <TrendMetricCard
            title={t("experts_title_pending")}
            value={pending.length}
            icon={<Clock className="h-4 w-4" />}
            trend={pending.length > 0 ? "up" : "neutral"}
            trendLabel={t("experts_trend_awaiting")}
            accentColor="#6366f1"
          />
        </div>
        <header className="mb-6">
          <h1 className="text-fg-primary text-fg-secondaryxl inline-flex items-center gap-2 font-bold">
            <Award className="text-brand-400 h-6 w-6" />{" "}
            {t("expertApplications", { defaultValue: "Expert Applications" })}
          </h1>
          <p className="text-fg-muted mt-1 text-sm">
            {t("manageExpertApplications", {
              defaultValue: "Review and manage expert panel applications.",
            })}
          </p>
        </header>

        <ExpertApplicationsList applications={applications} />
      </div>
    </div>
  );
}
