"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitVote } from "@/actions/dilemmas";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

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
  const [turnstileKey, setTurnstileKey] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const timer = setTimeout(() => {
      if (!turnstileToken && !turnstileError) {
        setTurnstileError(true);
        console.warn("[Turnstile] Script or widget failed to load within timeout.");
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [turnstileKey, turnstileToken, turnstileError]);

  const handleRetryTurnstile = () => {
    setTurnstileError(false);
    setTurnstileToken(null);
    setTurnstileKey((prev) => prev + 1);
  };

  const localizedTitle =
    locale === "tr" ? poll.title_tr || poll.title : poll.title_en || poll.title;
  const localizedDescription =
    locale === "tr"
      ? poll.description_tr || poll.description
      : poll.description_en || poll.description;

  const totalVotes = poll.yes_count + poll.no_count + poll.unsure_count;
  const yesPercent = totalVotes > 0 ? Math.round((poll.yes_count / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((poll.no_count / totalVotes) * 100) : 0;
  const unsurePercent = totalVotes > 0 ? 100 - yesPercent - noPercent : 0;

  const handleVote = async (voteType: "yes" | "no" | "unsure") => {
    if (turnstileError) {
      toast.error(t("turnstileError"));
      return;
    }
    if (!turnstileToken) {
      toast.error(t("turnstileRequired"));
      return;
    }

    setIsVoting(true);
    const result = await submitVote(poll.id, voteType, turnstileToken);
    setIsVoting(false);

    if (result.error) {
      toast.error(result.error);
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
          <h3 className="text-fg-primary mb-4 text-2xl font-extrabold">{localizedTitle}</h3>
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

            <div className="bg-bg-tertiary/40 relative flex h-8 w-full overflow-hidden rounded-md border border-white/5">
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
                  <span className="text-xs font-bold text-white/80 drop-shadow-md">
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
            <div className="text-fg-muted pt-1 text-center text-xs font-medium">
              {t("totalVotes", { count: totalVotes.toLocaleString() })}
            </div>
          </div>

          {/* Turnstile Widget (Invisible) */}
          {process.env.NODE_ENV === "production" && (
            <div className="flex flex-col items-center">
              <Turnstile
                key={turnstileKey}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "2x00000000000000000000AB"}
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setTurnstileError(false);
                }}
                onError={() => {
                  setTurnstileError(true);
                  console.error("[Turnstile] Failed to load or execute Turnstile widget.");
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
                options={{
                  theme: "dark",
                  size: "invisible",
                }}
              />
              {turnstileError && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <p className="text-danger-400 text-center text-xs font-medium">
                    ⚠️ {t("turnstileError")}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRetryTurnstile}
                    className="text-brand-400 hover:text-brand-300 animate-pulse text-xs font-bold underline"
                  >
                    {t("retryVerification")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("yes")}
              className="text-success-400 border-success-400/40 hover:bg-success-400/20 w-full font-bold transition-all disabled:opacity-40"
            >
              {t("yes")}
            </Button>
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("unsure")}
              className="text-fg-muted border-fg-muted/40 hover:bg-fg-muted/20 w-full font-bold transition-all disabled:opacity-40"
            >
              {t("unsureButton")}
            </Button>
            <Button
              variant="outline"
              disabled={isVoting}
              onClick={() => handleVote("no")}
              className="text-danger-400 border-danger-400/40 hover:bg-danger-400/20 w-full font-bold transition-all disabled:opacity-40"
            >
              {t("no")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
