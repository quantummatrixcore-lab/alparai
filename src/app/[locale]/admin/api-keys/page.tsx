import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Key } from "lucide-react";
import { EnterpriseApiKeysClient } from "@/components/admin/api-keys/enterprise-api-keys-client";

export default async function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Key className="h-6 w-6 text-yellow-500" />}
        title="Kurumsal B2B Risk API & Kota Yönetimi"
        subtitle="Manage high-throughput enterprise threat intelligence API keys, rate limit controls, webhook subscriptions, and cryptographic quotas."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "B2B API Keys", href: "/admin/api-keys" },
        ]}
      />

      <EnterpriseApiKeysClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "B2B Risk API & Key Management | ALPAR AI Admin",
  description: "Enterprise Risk Intelligence API Key & Rate Limit Management console.",
};
