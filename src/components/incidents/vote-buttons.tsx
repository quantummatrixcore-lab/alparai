"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { voteOnIncident } from "@/actions/incidents";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function VoteButtons({
  incidentId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = 0,
  disabled = false,
}: {
  incidentId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: -1 | 0 | 1;
  disabled?: boolean;
}) {
  const tCommon = useTranslations("common");
  const tFeed = useTranslations("feed");
  const [up, setUp] = useState(initialUpvotes);
  const [down, setDown] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [pending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    if (disabled || pending) return;
    const previous = userVote;
    let delta: number = value;
    if (previous === value) {
      delta = -value;
    } else if (previous !== 0) {
      delta = value * 2;
    }
    setUserVote(previous === value ? 0 : value);
    setUp((n) => n + (value === 1 ? delta : previous === 1 ? -1 : 0));
    setDown((n) => n + (value === -1 ? delta : previous === -1 ? -1 : 0));

    startTransition(async () => {
      const res = await voteOnIncident({ incidentId, value });
      if (!res.ok) {
        setUserVote(previous);
        setUp(initialUpvotes);
        setDown(initialDownvotes);
        toast.error(res.error ?? tCommon("loading"));
      }
    });
  };

  return (
    <div className="border-border-subtle bg-bg-secondary flex flex-col items-center gap-1 rounded-md border p-2">
      <button
        onClick={() => handleVote(1)}
        disabled={disabled || pending}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          userVote === 1
            ? "bg-success-500/15 text-success-400"
            : "text-fg-muted hover:bg-bg-tertiary hover:text-success-400",
          (disabled || pending) && "cursor-not-allowed opacity-50",
        )}
        aria-label={tFeed("upvote", { defaultValue: "Upvote" })}
        aria-pressed={userVote === 1}
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <span className="text-fg-primary text-sm font-semibold">{up - down}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={disabled || pending}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          userVote === -1
            ? "bg-danger-500/15 text-danger-400"
            : "text-fg-muted hover:bg-bg-tertiary hover:text-danger-400",
          (disabled || pending) && "cursor-not-allowed opacity-50",
        )}
        aria-label={tFeed("downvote", { defaultValue: "Downvote" })}
        aria-pressed={userVote === -1}
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
}
