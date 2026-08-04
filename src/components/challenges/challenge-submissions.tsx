"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { submitChallengeVote, removeChallengeVote } from "@/actions/challenges";

interface SubmissionRow {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  created_at: string;
}

export function ChallengeSubmissions({
  challengeId,
  userId,
}: {
  challengeId: string;
  userId?: string;
}) {
  const t = useTranslations("challenges");
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [subsRes, votesRes, userVotesRes] = await Promise.all([
        supabase
          .from("challenge_submissions")
          .select()
          .eq("challenge_id", challengeId)
          .eq("status", "approved"),
        supabase.from("challenge_votes").select("submission_id"),
        userId
          ? supabase.from("challenge_votes").select("submission_id").eq("user_id", userId)
          : Promise.resolve({ data: null }),
      ]);

      setSubmissions(subsRes.data ?? []);
      const counts: Record<string, number> = {};
      for (const v of (votesRes.data ?? []) as Array<{ submission_id: string }>) {
        counts[v.submission_id] = (counts[v.submission_id] ?? 0) + 1;
      }
      setVoteCounts(counts);
      if (userVotesRes?.data) {
        setUserVotes(
          new Set(
            (userVotesRes.data as Array<{ submission_id: string }>).map((v) => v.submission_id),
          ),
        );
      }
      setLoading(false);
    }
    load();
  }, [challengeId, userId]);

  if (loading) {
    return <p className="text-fg-muted text-sm">{t("loading")}</p>;
  }

  if (!submissions.length) {
    return <p className="text-fg-muted text-sm">{t("noSubmissions")}</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold tracking-wider text-white/60 uppercase">
        {t("submissions")}
      </h4>
      {submissions.map((sub) => {
        const voteCount = voteCounts[sub.id] ?? 0;
        const hasVoted = userVotes.has(sub.id);

        return (
          <div key={sub.id} className="rounded-lg border border-white/5 bg-white/[0.01] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium">{sub.title}</p>
                <p className="text-fg-secondary mt-1 text-sm">{sub.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-fg-muted text-xs">{voteCount}</span>
                <button
                  onClick={async () => {
                    if (!userId) return;
                    if (hasVoted) {
                      const res = await removeChallengeVote(sub.id);
                      if (res.ok) {
                        setUserVotes((prev) => {
                          const next = new Set(prev);
                          next.delete(sub.id);
                          return next;
                        });
                        setVoteCounts((prev) => ({ ...prev, [sub.id]: (prev[sub.id] ?? 1) - 1 }));
                      }
                    } else {
                      const res = await submitChallengeVote(sub.id);
                      if (res.ok) {
                        setUserVotes((prev) => new Set(prev).add(sub.id));
                        setVoteCounts((prev) => ({ ...prev, [sub.id]: (prev[sub.id] ?? 0) + 1 }));
                      }
                    }
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    hasVoted
                      ? "bg-brand-500/20 text-brand-300"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {hasVoted ? t("voted") : t("vote")}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
