import { setRequestLocale, getTranslations } from "next-intl/server";
import { constructPageMetadata } from "@/lib/seo/metadata";
import { AnalyzerClient } from "./analyzer-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analyzer" });

  return constructPageMetadata({
    locale,
    pathname: "/compliance/analyzer",
    title: `${t("title")} — ALPAR AI`,
    description: t("description"),
    keywords: ["AI compliance analyzer", "EU AI Act scanner", "LLM risk audit", "AI safety checker"],
  });
}

export default async function AnalyzerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnalyzerClient />;
}
