import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === "tr";

  return {
    title: isTr
      ? "Dijital İkizler — Yapay Zeka Ajan Konseyi"
      : "Digital Twins — AI Agent Council",
    description: isTr
      ? "Atatürk, İbn-i Sina, Fatih Sultan Mehmet ve 34+ Dijital İkiz ile gerçek zamanlı yapay zeka müzakere ve denetim platformu."
      : "Real-time AI deliberation and accountability platform powered by Atatürk, Avicenna, Mehmed II and 34+ Digital Twins.",
    alternates: {
      canonical: `/${locale}/digital-twins`,
      languages: {
        en: "/en/digital-twins",
        tr: "/tr/digital-twins",
      },
    },
    openGraph: {
      title: isTr
        ? "Dijital İkizler — Yapay Zeka Ajan Konseyi · ALPAR AI"
        : "Digital Twins — AI Agent Council · ALPAR AI",
      description: isTr
        ? "Atatürk, İbn-i Sina, Fatih Sultan Mehmet ve 34+ Dijital İkiz ile gerçek zamanlı yapay zeka müzakere platformu."
        : "Real-time AI deliberation platform powered by 34+ Digital Twins.",
      url: `/${locale}/digital-twins`,
    },
  };
}

export default function DigitalTwinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
