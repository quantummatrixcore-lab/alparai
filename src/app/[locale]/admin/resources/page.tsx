import { requireModerator } from "@/lib/auth/session";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ResourcesClient } from "@/components/admin/resources-client";
import { AdminContainer } from "@/components/admin/admin-design-kit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("resources_title") || "Resource Management"} | ALPAR AI Admin`,
  };
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Authenticate user & check moderator access
  await requireModerator();

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8">
      <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
        <AdminContainer>
          <ResourcesClient locale={locale} />
        </AdminContainer>
      </div>
    </div>
  );
}
