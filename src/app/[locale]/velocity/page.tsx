import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VelocityDashboard } from "@/components/public/velocity/velocity-dashboard";

interface VelocityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: VelocityPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "velocity" });

  return {
    title: `${t("page_title")} | ALPAR AI`,
    description: t("page_description"),
  };
}

export default async function VelocityPage({ params }: VelocityPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-bg-secondary min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <VelocityDashboard />
      </div>
    </div>
  );
}
