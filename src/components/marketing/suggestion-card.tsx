"use client";

import { Card } from "@/components/ui/card";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale } from "next-intl";
import { SUGGESTION_CATEGORIES, SUGGESTION_STATUSES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export interface SuggestionListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string | null;
}

export function SuggestionCard({ item }: { item: SuggestionListItem }) {
  const t = useTranslations("suggestions");
  const locale = useLocale();
  const statusLabel =
    SUGGESTION_STATUSES.find((s) => s.value === item.status)?.label ?? item.status;
  const catLabel =
    SUGGESTION_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

  return (
    <Card interactive padding="md">
      <div className="flex gap-4">
        <div className="bg-bg-tertiary flex w-12 shrink-0 flex-col items-center justify-center rounded-md p-2">
          <ThumbsUp className="text-brand-400 h-4 w-4" />
          <span className="text-fg-primary mt-1 text-sm font-bold">{item.upvote_count}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{catLabel}</Badge>
            <Badge variant="outline">{statusLabel}</Badge>
            <span className="text-fg-muted text-xs">
              {formatRelativeTime(new Date(item.created_at), locale)}
            </span>
          </div>
          <h3 className="text-fg-primary mt-2 line-clamp-2 text-base font-semibold">
            {item.title}
          </h3>
          <p className="text-fg-muted mt-1 line-clamp-2 text-sm">{item.description}</p>
          <div className="text-fg-muted mt-3 flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {item.comment_count}
            </span>
            <span>
              {t("by", { defaultValue: "by" })}{" "}
              {item.author_name ?? t("anon", { defaultValue: "Anonymous" })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
