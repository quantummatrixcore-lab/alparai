import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

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
      <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
        <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle>{t("autopilot_analytics") || "Autopilot Analytics"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-fg-muted">{result.error ?? tCommon("unknown_error")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        {/* Navigation Breadcrumb */}
        <header className="mb-6 flex items-center justify-between">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={"/admin"}
              className="text-fg-muted hover:text-brand-400 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("dashboard") || "Dashboard"}
            </Link>
            <span className="text-fg-muted">/</span>
            <Link
              href={"/admin/ai-hub/autopilot"}
              className="text-fg-muted hover:text-brand-400 transition-colors"
            >
              {t("autopilot") || "Autopilot"}
            </Link>
            <span className="text-fg-muted">/</span>
            <span className="text-brand-400 flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              {t("analytics") || "Analytics"}
            </span>
          </nav>
        </header>

        {/* Main Dashboard */}
        <AnalyticsDashboard snapshot={result.snapshot} locale={locale} />
      </div>
    </div>
  );
}
