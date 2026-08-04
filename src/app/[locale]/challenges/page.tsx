import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { ChallengeList } from "@/components/challenges/challenge-list";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenges" });
  return { title: t("pageTitle") };
}

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "challenges" });
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  const { data: challenges } = await supabase
    .from("challenges")
    .select()
    .eq("is_published", true)
    .order("starts_at", { ascending: false });

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
      <p className="text-fg-secondary mt-2 max-w-2xl">{t("subtitle")}</p>

      <ChallengeList challenges={challenges ?? []} locale={locale} userId={user?.id} />
    </Container>
  );
}
