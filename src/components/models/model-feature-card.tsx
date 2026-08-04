"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { useParams } from "next/navigation";
import { voteModelFeatureRequest } from "@/actions/model-features";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/utils/logger";
import type { ModelFeatureRequest } from "@/types";

interface ModelFeatureCardProps {
  request: ModelFeatureRequest;
}

const statusColors: Record<string, "default" | "warning" | "brand" | "success" | "danger"> = {
  open: "default",
  planned: "warning",
  in_progress: "brand",
  completed: "success",
  declined: "danger",
};

export function ModelFeatureCard({ request }: ModelFeatureCardProps) {
  const t = useTranslations("models");
  const params = useParams();
  const locale = params?.locale === "tr" ? tr : enUS;

  const [votes, setVotes] = React.useState(request.votes_count);
  const [hasVoted, setHasVoted] = React.useState(request.has_voted || false);
  const [isPending, startTransition] = React.useTransition();

  const handleVote = () => {
    startTransition(async () => {
      const res = await voteModelFeatureRequest(request.id);
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
      return formatDistanceToNow(new Date(request.created_at), {
        addSuffix: true,
        locale,
      });
    } catch (err) {
      logger.error("Failed to format date", undefined, err instanceof Error ? err : undefined);
      return "";
    }
  }, [request.created_at, locale]);

  const authorName = request.is_anonymous ? t("anonymous") : request.author_name || t("anonymous");

  return (
    <div className="border-border-subtle bg-bg-secondary/20 hover:border-brand-500/20 flex items-start gap-4 rounded-2xl border p-6 transition duration-300">
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`flex w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border p-3 transition duration-200 select-none disabled:opacity-50 ${
          hasVoted
            ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
            : "bg-bg-tertiary/60 border-border-strong text-fg-secondary hover:border-fg-primary hover:text-fg-primary"
        }`}
      >
        <ThumbsUp className={`mb-1 h-4 w-4 ${hasVoted ? "fill-brand-400" : ""}`} />
        <span className="text-xs font-bold">{votes}</span>
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {request.category}
          </Badge>
          <Badge variant={statusColors[request.status] || "default"} size="sm">
            {request.status}
          </Badge>
          <span className="text-fg-muted text-xs">
            {t("by", { author: authorName })} • {formattedDate}
          </span>
        </div>

        <h4 className="text-fg-primary text-base font-bold">{request.title}</h4>

        {request.description && (
          <p className="text-fg-secondary text-sm leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        )}
      </div>
    </div>
  );
}
