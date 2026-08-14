import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin/admin-design-kit";
import { Key } from "lucide-react";
import { SystemHubTabs } from "@/components/admin/system-hub-tabs";

export default async function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
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
          <AdminSectionCard title="Active Keys">
            <p className="text-zinc-400">
              No active keys found. Key generation is temporarily disabled for maintenance.
            </p>
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
