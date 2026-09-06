import { getTranslations, setRequestLocale } from "next-intl/server";
import { TwinsLeaderboardClient } from "./twins-leaderboard-client";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "twins" });
  return {
    title: t("title") || "Digital Twins Leaderboard",
    description: t("description") || "Agent-OS Digital Twins performance and logic matrix.",
  };
}

export default async function TwinsLeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // "Fetch" the data on the server side
  const initialData = Object.values(DIGITAL_TWINS);

  return <TwinsLeaderboardClient initialData={initialData} />;
}
