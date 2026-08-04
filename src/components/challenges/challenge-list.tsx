"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChallengeSubmissions } from "./challenge-submissions";
import { SubmissionForm } from "./submission-form";

interface ChallengeRow {
  id: string;
  title_en: string;
  title_tr: string;
  description_en: string;
  description_tr: string;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
  created_at: string;
}

export function ChallengeList({
  challenges,
  locale,
  userId,
}: {
  challenges: ChallengeRow[];
  locale: string;
  userId?: string;
}) {
  const t = useTranslations("challenges");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!challenges.length) {
    return (
      <div className="text-fg-secondary mt-12 rounded-xl border border-white/10 p-8 text-center">
        <p className="text-lg">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {challenges.map((challenge) => {
        const title = locale === "tr" ? challenge.title_tr : challenge.title_en;
        const description = locale === "tr" ? challenge.description_tr : challenge.description_en;
        const isActive = new Date(challenge.ends_at) > new Date();
        const isExpanded = expandedId === challenge.id;

        return (
          <div
            key={challenge.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6 transition hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  {isActive ? (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      {t("active")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/40">
                      {t("ended")}
                    </span>
                  )}
                </div>
                <p className="text-fg-secondary mt-1 text-sm">{description}</p>
                <p className="text-fg-muted mt-2 text-xs">
                  {new Date(challenge.starts_at).toLocaleDateString()} —{" "}
                  {new Date(challenge.ends_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                className="text-fg-muted hover:text-fg-primary shrink-0 rounded-lg px-3 py-1.5 text-sm transition hover:bg-white/5"
              >
                {isExpanded ? t("hide") : t("viewSubmissions")}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-6 border-t border-white/5 pt-6">
                <ChallengeSubmissions challengeId={challenge.id} userId={userId} />
                {userId && isActive && <SubmissionForm challengeId={challenge.id} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
