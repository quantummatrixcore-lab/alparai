import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { ApiManagementHub } from "@/components/admin/api-management/api-hub";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Zap } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("api_mgmt_meta_title") || "API & Model Gateway Management"} | ALPAR AI Admin`,
  };
}

export default async function ApiManagementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Zap className="text-brand-400 h-6 w-6" />}
        title={t("api_mgmt_h1") || "API Gateway & Model Management"}
        subtitle={
          t("api_mgmt_subtitle") ||
          "Live AI model health, provider routing, telemetry heatmap, and static key inventory."
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "API Management", href: "/admin/api-management" },
        ]}
      />

      <ApiManagementHub />
    </AdminContainer>
  );
}
