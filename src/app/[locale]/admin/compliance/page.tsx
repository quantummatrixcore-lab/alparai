import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Scale } from "lucide-react";
import { ComplianceRadarClient } from "@/components/admin/compliance/compliance-radar-client";

export default async function CompliancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Scale className="h-6 w-6 text-rose-400" />}
        title="EU AI Act & Legal Risk Radar"
        subtitle="Comprehensive regulatory governance cockpit tracking EU AI Act Tier classifications, Article 73 serious incident SLAs, and statutory penalty exposure."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Compliance Radar", href: "/admin/compliance" },
        ]}
      />

      <ComplianceRadarClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "EU AI Act Compliance Radar | ALPAR AI Admin",
  description:
    "EU AI Act & Legal Risk Radar monitoring Article 5 prohibitions, Annex III high-risk systems, and statutory penalties.",
};
