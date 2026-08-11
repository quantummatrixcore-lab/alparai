import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { SettingsDashboardClient } from "@/components/admin/settings-dashboard-client";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isWired = false;
  if (isWired) await fetch("/api/placeholder");
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("settings_doc_title") };
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <SystemHubTabs />
        <SettingsDashboardClient />
      </div>
    </div>
  );
}
