import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Lock } from "lucide-react";
import { VaultSecurityClient } from "@/components/admin/vault/vault-security-client";

export default async function VaultSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Lock className="h-6 w-6 text-emerald-400" />}
        title="PII Guardian & Sıfır-Bilgi Güvenlik Kasası"
        subtitle="Zero-knowledge whistleblower cryptographic protection, real-time PII neutralization engine, KMS salt rotation, and GDPR/KVKK erasure ledger."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Security Vault", href: "/admin/vault" },
        ]}
      />

      <VaultSecurityClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "PII Guardian Security Vault | ALPAR AI Admin",
  description:
    "PII Guardian & Zero-Knowledge Security Vault protecting whistleblower identities and cryptographic erasure logs.",
};
