import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { BarChart3 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getCrossAuditDashboardData } from "@/actions/admin/cross-audit-metrics";
import { CrossAuditDashboardClient } from "@/components/admin/cross-audit-dashboard-client";

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
    <Container className="py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-fg-primary inline-flex items-center gap-2 text-2xl font-bold">
            <BarChart3 className="text-brand-400 h-6 w-6" />
            {t("cross_audit_dashboard_heading") || "Cross-Audit Dashboard"}
          </h1>
          <p className="text-fg-muted mt-1 text-sm">
            {t("cross_audit_dashboard_subheading") ||
              "Real-time auditing metrics, ethics alignment & regulatory classification logs."}
          </p>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href={"/admin"}
            className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary rounded-md px-3 py-1.5 transition-colors"
          >
            {t("dashboard") || "Dashboard"}
          </Link>
          <Link
            href={"/admin/moderation"}
            className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary rounded-md px-3 py-1.5 transition-colors"
          >
            {t("moderation") || "Moderation"}
          </Link>
          <span className="bg-bg-tertiary text-brand-400 rounded-md px-3 py-1.5 font-medium">
            {t("metrics") || "Metrics"}
          </span>
        </nav>
      </header>

      <CrossAuditDashboardClient data={metricsData} />
    </Container>
  );
}
