import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("autopilot_analytics") || "Autopilot Analytics" };
}

export default async function AdminAutopilotAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/signin?next=/${locale}/admin/ai-hub/autopilot/analytics`);
  }
  if (user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "admin" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const result = await getAdminAutopilotSnapshot(100);
  if (!result.ok || !result.snapshot) {
    return (
      <AdminContainer shell>
        <Card className="border-border-subtle/50 bg-white/[0.02]">
          <CardHeader>
            <CardTitle>{t("autopilot_analytics") || "Autopilot Analytics"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fg-muted">{result.error ?? tCommon("unknown_error")}</p>
          </CardContent>
        </Card>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer shell>
      <AdminPageHeader
        title={t("autopilot_analytics") || "Autopilot Analytics"}
        icon={<Sparkles className="text-brand-400 h-6 w-6" />}
        breadcrumb={[
          { label: t("dashboard") || "Dashboard", href: "/admin" },
          { label: t("autopilot") || "Autopilot", href: "/admin/ai-hub/autopilot" },
          { label: t("analytics") || "Analytics", href: "/admin/ai-hub/autopilot/analytics" },
        ]}
      />

      <AnalyticsDashboard snapshot={result.snapshot} locale={locale} />
    </AdminContainer>
  );
}
