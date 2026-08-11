import { requireAdmin } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SignalsClient } from "@/components/admin/signals-client";
import { getSystemSignalsAction } from "@/actions/admin/signals";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Activity } from "lucide-react";

import { MetricsHubTabs } from "@/components/admin/metrics-hub-tabs";

export default async function SignalsPage({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const signals = await getSystemSignalsAction();

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <AdminContainer>
          <MetricsHubTabs />
          <AdminPageHeader
            icon={<Activity className="h-6 w-6 text-cyan-400" />}
            title={t("signals_title") || "Telemetry & Signal Control"}
            subtitle={
              t("signals_subtitle") ||
              "Live real-time system metrics, performance telemetry, and health gauges."
            }
            breadcrumb={[
              { label: "Admin", href: "/admin" },
              { label: "Metrics Hub", href: "/admin/metrics-hub" },
              { label: "Signals", href: "/admin/metrics-hub/signals" },
            ]}
          />

          <SignalsClient initialSignals={signals} />
        </AdminContainer>
      </div>
    </div>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
