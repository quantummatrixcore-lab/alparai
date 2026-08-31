import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Suggestions | AlparAI`,
    description: `Community-driven suggestions for AI accountability improvements`,
    openGraph: {
      title: `Suggestions | AlparAI`,
      description: `Community-driven suggestions for AI accountability improvements`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Suggestions | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function SuggestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dilemmas`);
}
