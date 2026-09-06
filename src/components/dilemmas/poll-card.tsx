"use client";

import { useState, useRef, useEffect } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitVote } from "@/actions/community/dilemmas";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Check } from "lucide-react";

export type Poll = {
  id: string;
  title: string;
  description: string;
  yes_count: number;
  no_count: number;
  unsure_count: number;
  title_tr?: string | null;
  title_en?: string | null;
  description_tr?: string | null;
  description_en?: string | null;
};

export function PollCard({ poll }: { poll: Poll }) {
  const t = useTranslations("dilemmas");
  const locale = useLocale();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    process.env.NODE_ENV === "development" ? "dev-bypass-token" : null,
  );
  const [turnstileError, setTurnstileError] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userChoice, setUserChoice] = useState<"yes" | "no" | "unsure" | null>(null);

  // Optimistic counts
  const [yesCount, setYesCount] = useState(poll.yes_count);
  const [noCount, setNoCount] = useState(poll.no_count);
  const [unsureCount, setUnsureCount] = useState(poll.unsure_count);

  const [turnstileKey, _setTurnstileKey] = useState(0);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const pendingVoteRef = useRef<"yes" | "no" | "unsure" | null>(null);

  useEffect(() => {
    try {
      const storedVote = localStorage.getItem(`alpar_voted_poll_${poll.id}`);
      if (storedVote === "yes" || storedVote === "no" || storedVote === "unsure") {
        setHasVoted(true);
        setUserChoice(storedVote);
      }
    } catch {
      // localStorage not available
    }
  }, [poll.id]);

  const localizedTitle =
    locale === "tr" ? poll.title_tr || poll.title : poll.title_en || poll.title;
  const localizedDescription =
    locale === "tr"
      ? poll.description_tr || poll.description
      : poll.description_en || poll.description;

  const totalVotes = yesCount + noCount + unsureCount;
  const yesPercent = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((noCount / totalVotes) * 100) : 0;
  const unsurePercent = totalVotes > 0 ? 100 - yesPercent - noPercent : 0;

  const handleVote = async (voteType: "yes" | "no" | "unsure") => {
    if (hasVoted) {
      toast.info(t("alreadyVoted"), {
        description: t("alreadyVotedDesc"),
      });
      return;
    }

    // Optimistic UI update
    setHasVoted(true);
    setUserChoice(voteType);
    if (voteType === "yes") setYesCount((prev) => prev + 1);
    else if (voteType === "no") setNoCount((prev) => prev + 1);
    else if (voteType === "unsure") setUnsureCount((prev) => prev + 1);

    try {
      localStorage.setItem(`alpar_voted_poll_${poll.id}`, voteType);
    } catch {
      // Ignore
    }

    setIsVoting(true);
    if (turnstileToken) {
      await executeVote(voteType, turnstileToken);
    } else if (turnstileRef.current && !turnstileError) {
      pendingVoteRef.current = voteType;
      turnstileRef.current.execute();
      setTimeout(() => {
        if (pendingVoteRef.current) {
          executeVote(pendingVoteRef.current, "fallback-session-token");
        }
      }, 1500);
    } else {
      await executeVote(voteType, "fallback-session-token");
    }
  };

  const executeVote = async (voteType: "yes" | "no" | "unsure", token: string) => {
    setIsVoting(true);
    const result = await submitVote(poll.id, voteType, token);
    setIsVoting(false);
    pendingVoteRef.current = null;
    try {
      turnstileRef.current?.reset();
    } catch {
      // Ignore reset errors
    }

    if (result.error) {
      if (result.code === "ALREADY_VOTED" || result.error.toLowerCase().includes("already")) {
        toast.info(t("alreadyVoted"), {
          description: t("alreadyVotedDesc"),
        });
      } else {
        toast.error(result.error);
      }
    } else {
      if (result.awardedBadge) {
        toast.success(t("newBadgeTitle"), {
          description: t("newBadgeDesc"),
          duration: 8000,
        });
      } else {
        toast.success(t("voteRecorded"), {
          description: t("voteRecordedDesc"),
        });
      }
    }
  };

  return (
    <Card
      variant="elevated"
      className="border-brand-500/30 hover:border-brand-500/60 bg-bg-primary/50 flex flex-col shadow-2xl backdrop-blur-md transition-all duration-300"
    >
      <CardContent className="flex flex-1 flex-col p-8">
        <div className="flex-1 text-center">
          <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 mb-4 inline-block rounded-full border px-3 py-1 text-xs font-bold tracking-widest uppercase">
            {t("criticalQuestion")}
          </div>
          <h3 className="text-fg-primary text-2xl mb-4 font-extrabold">
            {localizedTitle}
          </h3>
          <p className="text-fg-secondary mb-8 text-sm leading-relaxed">{localizedDescription}</p>
        </div>

        <div className="space-y-6">
          {/* Professional Graph Bar */}
          <div className="space-y-2">
            <div className="flex justify-between px-1 text-xs font-medium">
              <span className="text-success-400 font-bold tracking-wider uppercase">
                {t("yes")}
              </span>
              <span className="text-fg-muted font-bold tracking-wider uppercase">
                {t("unsure")}
              </span>
              <span className="text-danger-400 font-bold tracking-wider uppercase">{t("no")}</span>
            </div>

            <div className="bg-bg-tertiary/40 border-border-subtle/50 relative flex h-8 w-full overflow-hidden rounded-md border">
              <div
                className="bg-success-500/90 group relative flex h-full items-center justify-start px-2 transition-all duration-1000 ease-out"
                style={{ width: `${yesPercent}%` }}
              >
                {yesPercent > 5 && (
                  <span className="text-xs font-bold text-white/90 drop-shadow-md">
                    %{yesPercent}
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </div>
              <div
                className="bg-fg-muted/40 group relative flex h-full items-center justify-center transition-all duration-1000 ease-out"
                style={{ width: `${unsurePercent}%` }}
              >
                {unsurePercent > 5 && (
                  <span className="text-fg-secondary text-xs font-bold drop-shadow-md">
                    %{unsurePercent}
                  </span>
                )}
              </div>
              <div
                className="bg-danger-500/90 group relative flex h-full items-center justify-end px-2 transition-all duration-1000 ease-out"
                style={{ width: `${noPercent}%` }}
              >
                {noPercent > 5 && (
                  <span className="text-xs font-bold text-white/90 drop-shadow-md">
                    %{noPercent}
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </div>
            </div>
            <div
              suppressHydrationWarning
              className="text-fg-muted pt-1 text-center text-xs font-medium"
            >
              {t("totalVotes", { count: totalVotes.toLocaleString() })}
            </div>
          </div>

          {/* Turnstile Widget (Invisible) */}
          {process.env.NODE_ENV === "production" && (
            <div className="flex flex-col items-center">
              <Turnstile
                ref={turnstileRef}
                key={turnstileKey}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "2x00000000000000000000AB"}
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setTurnstileError(false);
                  if (pendingVoteRef.current) {
                    executeVote(pendingVoteRef.current, token);
                  }
                }}
                onError={() => {
                  setTurnstileError(true);
                  console.warn("[Turnstile] Falling back to session token for voting.");
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
                options={{
                  theme: "dark",
                  size: "invisible",
                  execution: "execute",
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("yes")}
              className={`w-full font-bold transition-all ${
                userChoice === "yes"
                  ? "border-success-400 bg-success-500/20 text-success-300 ring-success-400/40 ring-2"
                  : "text-success-400 border-success-400/40 hover:bg-success-400/20"
              }`}
            >
              {userChoice === "yes" && <Check className="mr-1 h-3.5 w-3.5" />}
              {t("yes")}
            </Button>
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("unsure")}
              className={`w-full font-bold transition-all ${
                userChoice === "unsure"
                  ? "border-fg-muted bg-fg-muted/20 text-fg-primary ring-fg-muted/40 ring-2"
                  : "text-fg-muted border-fg-muted/40 hover:bg-fg-muted/20"
              }`}
            >
              {userChoice === "unsure" && <Check className="mr-1 h-3.5 w-3.5" />}
              {t("unsureButton")}
            </Button>
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("no")}
              className={`w-full font-bold transition-all ${
                userChoice === "no"
                  ? "border-danger-400 bg-danger-500/20 text-danger-300 ring-danger-400/40 ring-2"
                  : "text-danger-400 border-danger-400/40 hover:bg-danger-400/20"
              }`}
            >
              {userChoice === "no" && <Check className="mr-1 h-3.5 w-3.5" />}
              {t("no")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
