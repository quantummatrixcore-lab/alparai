import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-design-kit";
import { Settings as SettingsIcon } from "lucide-react";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <SystemHubTabs />
        <AdminPageHeader
          icon={<SettingsIcon className="h-6 w-6 text-zinc-400" />}
          title={t("settings") || "Platform Settings"}
          subtitle="Configure core platform parameters and preferences."
          lastUpdated={new Date().toLocaleDateString(locale)}
          breadcrumb={[
            { label: "Admin", href: "/admin" },
            { label: "Settings", href: "/admin/settings" },
          ]}
        />

        <div className="grid grid-cols-1 gap-6">
          <AdminSectionCard title="General Preferences">
            <p className="text-zinc-400">
              Settings configuration panel is currently under maintenance. Core services continue to
              operate normally.
            </p>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Settings | ALPAR AI",
  description: "Configure ALPAR AI settings.",
};
