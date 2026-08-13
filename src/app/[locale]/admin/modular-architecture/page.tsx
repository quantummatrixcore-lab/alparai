import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth/session";
import { getModularArchitectureAction } from "@/actions/admin/modular-architecture";
import { getTranslations, setRequestLocale } from "next-intl/server";
const ModularArchitectureView = dynamic(() =>
  import("@/components/admin/modular-architecture/modular-architecture-view").then(
    (m) => m.ModularArchitectureView,
  ),
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: t("modular_architecture_title", { defaultValue: "Modüler Mimari Durumu · ALPAR AI" }),
  };
}

/** Responsive Modular Architecture Admin Page */
export default async function ModularArchitectureAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const data = await getModularArchitectureAction();

  return <ModularArchitectureView data={data} />;
}
