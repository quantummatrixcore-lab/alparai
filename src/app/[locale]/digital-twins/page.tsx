import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { constructPageMetadata } from "@/lib/seo/metadata";
import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";
import { DIGITAL_TWINS_LIST } from "@/lib/agent-os/personas";
import { DigitalTwinsClient } from "./DigitalTwinsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === "tr";
  const title = isTr
    ? "Dijital İkizler & Bilge Danışma Kurulu — ALPAR AI"
    : "Digital Twins & Expert AI Council — ALPAR AI";
  const description = isTr
    ? "Tarihe yön veren dehaların yapay zeka ikizleriyle strateji, güvenlik ve yönetim danışmanlığı."
    : "Consult historical geniuses powered by multi-model AI arbitrage for strategy, ethics, and innovation.";

  return constructPageMetadata({
    locale,
    pathname: "/digital-twins",
    title,
    description,
    keywords: ["digital twins", "AI council", "Atatürk AI", "Leonardo Da Vinci AI", "multi-agent reasoning"],
  });
}

export default async function DigitalTwinsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isTr = locale === "tr";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${APP_URL}/${locale}` },
          { name: isTr ? "Dijital İkizler" : "Digital Twins", url: `${APP_URL}/${locale}/digital-twins` },
        ]}
      />
      <CollectionPageJsonLd
        name={isTr ? "Dijital İkizler Konseyi" : "Digital Twins AI Council"}
        description={isTr ? "Dehaların dijital ikizleri koleksiyonu" : "Collection of genius AI personas"}
        url={`${APP_URL}/${locale}/digital-twins`}
        items={DIGITAL_TWINS_LIST.map((t) => ({
          name: t.name,
          url: `${APP_URL}/${locale}/digital-twins`,
          description: t.title,
        }))}
      />
      <DigitalTwinsClient />
    </>
  );
}
