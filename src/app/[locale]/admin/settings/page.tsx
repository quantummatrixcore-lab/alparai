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
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <SystemHubTabs />
        <AdminPageHeader
          icon={<SettingsIcon className="text-fg-muted h-6 w-6" />}
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
            <p className="text-fg-muted">
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
