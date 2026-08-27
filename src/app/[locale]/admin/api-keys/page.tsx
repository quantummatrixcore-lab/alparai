import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-design-kit";
import { Key } from "lucide-react";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";
import { ApiKeyManager } from "@/components/admin/api-management/api-key-manager";

export default async function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <SystemHubTabs />
        <AdminPageHeader
          icon={<Key className="h-6 w-6 text-yellow-500" />}
          title={t("apiKeys") || "API Keys Management"}
          subtitle="Manage authentication keys for platform integrations and external services."
          lastUpdated={new Date().toLocaleDateString(locale)}
          breadcrumb={[
            { label: "Admin", href: "/admin" },
            { label: "API Keys", href: "/admin/api-keys" },
          ]}
        />

        <div className="grid grid-cols-1 gap-6">
          <AdminSectionCard title="API Keys & Access Management">
            <ApiKeyManager providers={[]} />
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "API Keys | ALPAR AI",
  description: "Manage ALPAR AI API keys.",
};
