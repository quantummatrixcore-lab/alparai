import dynamic from "next/dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { BarChart3 } from "lucide-react";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { getCrossAuditDashboardData } from "@/actions/admin/cross-audit-metrics";
const CrossAuditDashboardClient = dynamic(() =>
  import("@/components/admin/cross-audit-dashboard-client").then(
    (m) => m.CrossAuditDashboardClient,
  ),
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("cross_audit_dashboard_title") || "Cross-Audit Dashboard"} | ALPAR AI Admin`,
  };
}

export default async function CrossAuditDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/cross-audit-dashboard`);
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const metricsData = await getCrossAuditDashboardData();

  return (
    <AdminContainer shell>
      <AdminPageHeader
        title={t("cross_audit_dashboard_heading") || "Cross-Audit Dashboard"}
        subtitle={
          t("cross_audit_dashboard_subheading") ||
          "Real-time auditing metrics, ethics alignment & regulatory classification logs."
        }
        icon={<BarChart3 className="text-brand-400 h-6 w-6" />}
        breadcrumb={[
          { label: t("dashboard") || "Dashboard", href: "/admin" },
          { label: t("moderation") || "Moderation", href: "/admin/moderation" },
          { label: t("metrics") || "Metrics", href: "/admin/cross-audit-dashboard" },
        ]}
      />

      <CrossAuditDashboardClient data={metricsData} />
    </AdminContainer>
  );
}
