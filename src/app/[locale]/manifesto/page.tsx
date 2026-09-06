import { setRequestLocale } from "next-intl/server";
import { ConstitutionClient } from "@/components/constitution/constitution-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Manifesto | AlparAI`,
    description: `AlparAI's commitment to transparent and accountable AI`,
    openGraph: {
      title: `Manifesto | AlparAI`,
      description: `AlparAI's commitment to transparent and accountable AI`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Manifesto | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function ManifestoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-bg-primary">
      <ConstitutionClient />
    </div>
  );
}