import { useTranslations } from "next-intl";
import { NotFoundClient } from "@/components/ui/not-found-client";

export default function LocaleNotFound() {
  const t = useTranslations("errors");
  const tNav = useTranslations("nav");

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-bg-primary px-4 py-16">
      <NotFoundClient
        code="404"
        badge={t("error_404")}
        title={t("notFoundTitle")}
        description={t("notFoundDesc")}
        homeLabel={t("goHome")}
        homeDesc={t("goHomeDesc")}
        incidentsLabel={tNav("incidents")}
        incidentsDesc={t("browseDesc")}
        backLabel={t("goBack")}
      />
    </div>
  );
}
