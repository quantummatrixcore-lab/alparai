import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, MessageCircle, ThumbsUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { SUGGESTION_CATEGORIES, SUGGESTION_STATUSES } from "@/lib/constants";
import {
  SuggestionCommentList,
  type CommentType,
} from "@/components/suggestions/suggestion-comment-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "suggestions" });
  const supabase = await createServerClient();
  const { data } = await supabase.from("suggestions").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? t("pageTitle", { defaultValue: "Suggestion Detail" }) };
}

export default async function SuggestionDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "suggestions" });
  const supabase = await createServerClient();

  // Fetch suggestion
  const { data: suggestion, error } = await supabase
    .from("suggestions")
    .select(
      "id, title, description, category, status, upvotes_count, comments_count, created_at, user_id, is_anonymous, users(full_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !suggestion) {
    notFound();
    return null;
  }

  // Fetch comments
  const { data: commentsData } = await supabase
    .from("suggestion_comments")
    .select("id, comment_text, created_at, user_id, users(full_name, avatar_url, role)")
    .eq("suggestion_id", id)
    .order("created_at", { ascending: true });

  const statusLabel =
    SUGGESTION_STATUSES.find((s) => s.value === suggestion.status)?.label ?? suggestion.status;
  const catLabel =
    SUGGESTION_CATEGORIES.find((c) => c.value === suggestion.category)?.label ??
    suggestion.category;

  const authorName = suggestion.is_anonymous
    ? t("anon", { defaultValue: "Anonymous" })
    : ((suggestion.users as Record<string, unknown>)?.full_name ??
      t("anon", { defaultValue: "Anonymous" }));

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="mb-8">
        <Link
          href="/dilemmas?tab=suggestions"
          className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_suggestions", { defaultValue: "Back to Suggestions" })}
        </Link>
      </div>

      <article className="space-y-12">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{catLabel}</Badge>
            <Badge variant="outline">{statusLabel}</Badge>
            <span className="text-fg-muted text-xs">
              {formatRelativeTime(new Date(suggestion.created_at), locale)}
            </span>
          </div>

          <h1 className="text-fg-primary text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {suggestion.title}
          </h1>

          <div className="text-fg-muted flex flex-wrap items-center gap-4 text-sm">
            <span>
              {t("by", { defaultValue: "by" })} {String(authorName)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" /> {suggestion.upvotes_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {suggestion.comments_count}
            </span>
          </div>
        </header>

        <Card className="border-border-subtle bg-bg-secondary/40">
          <CardContent className="prose prose-invert text-fg-primary max-w-none p-6 whitespace-pre-wrap sm:p-8">
            {suggestion.description}
          </CardContent>
        </Card>

        {/* Client component for Upvote and Comments */}
        <SuggestionCommentList
          suggestionId={suggestion.id}
          initialComments={(commentsData as unknown as CommentType[]) || []}
        />
      </article>
    </main>
  );
}
