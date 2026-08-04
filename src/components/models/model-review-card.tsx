"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Star, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { useParams } from "next/navigation";
import { voteModelReview } from "@/actions/model-reviews";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";
import type { ModelReview } from "@/types";

interface ModelReviewCardProps {
  review: ModelReview;
}

export function ModelReviewCard({ review }: ModelReviewCardProps) {
  const t = useTranslations("models");
  const params = useParams();
  const locale = params?.locale === "tr" ? tr : enUS;

  const [votes, setVotes] = React.useState(review.helpful_count);
  const [hasVoted, setHasVoted] = React.useState(review.has_voted || false);
  const [isPending, startTransition] = React.useTransition();

  const handleVote = () => {
    startTransition(async () => {
      const res = await voteModelReview(review.id);
      if (res.ok) {
        if (res.toggled === "added") {
          setVotes((prev) => prev + 1);
          setHasVoted(true);
        } else {
          setVotes((prev) => Math.max(0, prev - 1));
          setHasVoted(false);
        }
        toast.success(t("vote_success"));
      } else {
        toast.error(res.error || "Failed to submit vote");
      }
    });
  };

  const formattedDate = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(review.created_at), {
        addSuffix: true,
        locale,
      });
    } catch (err) {
      logger.error("Failed to format date", undefined, err instanceof Error ? err : undefined);
      return "";
    }
  }, [review.created_at, locale]);

  const authorName = review.is_anonymous ? t("anonymous") : review.author_name || t("anonymous");

  const ratingDimensions = [
    { label: t("dimensions.accuracy"), val: review.score_accuracy },
    { label: t("dimensions.safety"), val: review.score_safety },
    { label: t("dimensions.creativity"), val: review.score_creativity },
    { label: t("dimensions.speed"), val: review.score_speed },
    { label: t("dimensions.value"), val: review.score_value },
  ].filter((d) => d.val !== null && d.val !== undefined && d.val > 0);

  return (
    <div className="border-border-subtle bg-bg-secondary/20 hover:border-brand-500/20 space-y-4 rounded-2xl border p-6 transition duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-fg-primary text-sm font-semibold">{authorName}</span>
          <span className="text-fg-muted text-xs">{formattedDate}</span>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.score_overall
                  ? "fill-brand-400 text-brand-400"
                  : "text-border-strong"
              }`}
            />
          ))}
        </div>
      </div>

      {ratingDimensions.length > 0 && (
        <div className="border-border-subtle flex flex-wrap gap-2 border-y py-1">
          {ratingDimensions.map((dim) => (
            <div
              key={dim.label}
              className="bg-bg-tertiary border-border-subtle text-fg-secondary flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
            >
              <span>{dim.label}:</span>
              <span className="text-fg-primary font-bold">{dim.val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {review.title && <h4 className="text-fg-primary text-base font-bold">{review.title}</h4>}
        {review.body && (
          <p className="text-fg-secondary text-sm leading-relaxed whitespace-pre-line">
            {review.body}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleVote}
          disabled={isPending}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 disabled:opacity-50 ${
            hasVoted
              ? "bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20"
              : "border-border-strong text-fg-secondary hover:border-fg-primary hover:text-fg-primary bg-transparent"
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? "fill-brand-400" : ""}`} />
          <span>{t("helpful", { count: votes })}</span>
        </button>
      </div>
    </div>
  );
}
