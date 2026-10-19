import { setRequestLocale, getTranslations } from "next-intl/server";
import { PitchDeckViewer } from "@/components/deck/pitch-deck";
import { constructPageMetadata } from "@/lib/seo/metadata";

import { SUPPORTED_LOCALES } from "@/lib/constants";

export const revalidate = 60;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deck" });
  return constructPageMetadata({
    locale,
    pathname: "/deck",
    title: `${t("meta_title")} — ALPAR AI`,
    description: t("meta_desc"),
    keywords: ["pitch deck", "AI accountability investor deck", "trust infrastructure presentation", "Alpar AI pitch"],
  });
}

export default async function DeckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PitchDeckViewer />;
}
export const runtime = "nodejs";
