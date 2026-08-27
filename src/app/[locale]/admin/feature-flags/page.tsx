import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { getFeatureFlagsAction } from "@/actions/system-mgmt";
import { FeatureFlagsClient } from "@/components/admin/feature-flags-client";
import { AdminPageHeader } from "@/components/admin/admin-design-kit";
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
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
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
      </div>
    </div>
  );
}
