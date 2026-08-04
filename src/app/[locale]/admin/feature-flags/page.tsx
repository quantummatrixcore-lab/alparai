import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { getFeatureFlagsAction } from "@/actions/system-mgmt";
import { FeatureFlagsClient } from "@/components/admin/feature-flags-client";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Flag } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("nav_featureFlags") || "Feature Flags"} | ALPAR AI Admin` };
}

export default async function FeatureFlagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  const flags = await getFeatureFlagsAction();

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Flag className="text-brand-400 h-6 w-6" />}
        title={t("nav_featureFlags") || "Live Feature Flags Management"}
        subtitle={
          t("sistem_zelliklerini_pii_guardian_sybil_s") ||
          "Manage system features, PII guardian rules, and edge caches in real-time."
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Feature Flags", href: "/admin/feature-flags" },
        ]}
      />

      <FeatureFlagsClient initialFlags={flags} />
    </AdminContainer>
  );
}
