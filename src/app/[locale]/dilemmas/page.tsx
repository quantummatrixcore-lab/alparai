import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { CommunityHub } from "@/components/dilemmas/community-hub";
import { getCurrentUser } from "@/lib/auth/session";
import type { Poll } from "@/components/dilemmas/poll-card";
import type { SuggestionListItem } from "@/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dilemmas" });
  return { title: t("pageTitle") };
}

export default async function DilemmasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dilemmas" });
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  // Fetch active polls and suggestions in parallel
  const [pollsResult, suggestionsResult] = await Promise.all([
    supabase
      .from("ai_polls")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .returns<Poll[]>(),
    supabase
      .from("suggestions")
      .select(
        "id, title, description, title_tr, description_tr, category, status, upvotes_count, comments_count, created_at, user_id",
      )
      .order("upvotes_count", { ascending: false })
      .limit(50),
  ]);

  const polls = pollsResult.data ?? [];
  const suggestionsData = suggestionsResult.data ?? [];

  const suggestions: SuggestionListItem[] = (
    (suggestionsData as unknown as Array<Record<string, unknown>>) ?? []
  ).map((r) => ({
    id: r["id"] as string,
    title: r["title"] as string,
    description: r["description"] as string,
    title_tr: (r["title_tr"] as string | null) ?? null,
    description_tr: (r["description_tr"] as string | null) ?? null,
    category: r["category"] as string,
    status: r["status"] as string,
    upvote_count: (r["upvotes_count"] as number) ?? 0,
    comment_count: (r["comments_count"] as number) ?? 0,
    created_at: r["created_at"] as string,
    author_name: null,
  }));

  return (
    <Container className="py-12">
      <header className="mx-auto mb-8 max-w-3xl space-y-4 text-center">
        <h1 className="bg-gradient-brand bg-clip-text pb-2 text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
          {t("hubTitle")}
        </h1>
        <p className="text-fg-muted text-lg">{t("hubDescription")}</p>
      </header>

      <CommunityHub polls={polls} suggestions={suggestions} isLoggedIn={!!user} />
    </Container>
  );
}
