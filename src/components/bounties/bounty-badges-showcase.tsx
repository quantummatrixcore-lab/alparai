"use client";

import { Trophy, Award, Medal, Crown, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import type { BountyBadgeWithStats } from "@/actions/bounties";

interface BountyBadgesShowcaseProps {
  badges: BountyBadgeWithStats[];
  userBadgeCodes?: string[];
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    unlocked: string;
    locked: string;
    earnedBy: (count: number) => string;
    requirementLabel: (code: string, threshold: number) => string;
  };
}

export function BountyBadgesShowcase({
  badges,
  userBadgeCodes = [],
  locale,
  labels,
}: BountyBadgesShowcaseProps) {
  const getBadgeIcon = (code: string) => {
    switch (code) {
      case "bug_hunter_gold":
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case "bug_hunter_silver":
        return <Medal className="h-6 w-6 text-slate-300" />;
      case "bug_hunter_bronze":
        return <Award className="h-6 w-6 text-amber-600" />;
      case "ethics_advocate":
        return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
      case "bug_hunter_first":
      default:
        return <Trophy className="h-6 w-6 text-amber-400" />;
    }
  };

  const getBadgeColor = (code: string, isUnlocked: boolean) => {
    if (!isUnlocked && userBadgeCodes.length > 0) {
      return "border-border-subtle bg-bg-secondary/20 text-fg-muted opacity-70";
    }

    switch (code) {
      case "bug_hunter_gold":
        return "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)]";
      case "bug_hunter_silver":
        return "border-slate-400/50 bg-slate-400/10 shadow-[0_0_15px_rgba(148,163,184,0.1)]";
      case "bug_hunter_bronze":
        return "border-amber-700/50 bg-amber-700/10 shadow-[0_0_15px_rgba(180,83,9,0.1)]";
      case "ethics_advocate":
        return "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
      case "bug_hunter_first":
      default:
        return "border-warning-500/50 bg-warning-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
    }
  };

  if (badges.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-fg-primary text-xl font-extrabold tracking-tight md:text-2xl">
          {labels.title}
        </h2>
        <p className="text-fg-muted text-sm">{labels.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {badges.map((badge) => {
          const isUnlocked = userBadgeCodes.includes(badge.code);
          const name = locale === "tr" ? badge.name_tr : badge.name_en;
          const description = locale === "tr" ? badge.description_tr : badge.description_en;
          const requirementText = labels.requirementLabel(badge.code, badge.threshold_count);

          return (
            <div
              key={badge.code}
              className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 ${getBadgeColor(badge.code, isUnlocked)}`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="border-border-subtle bg-bg-tertiary flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                    {getBadgeIcon(badge.code)}
                  </div>
                  {userBadgeCodes.length > 0 && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        isUnlocked
                          ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                          : "bg-bg-tertiary text-fg-muted border-border-subtle border"
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          {labels.unlocked}
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          {labels.locked}
                        </>
                      )}
                    </span>
                  )}
                </div>

                <h3 className="text-fg-primary text-base font-bold">{name}</h3>
                <p className="text-fg-muted mt-1 text-xs leading-relaxed">{description}</p>
              </div>

              <div className="border-border-subtle mt-4 border-t pt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-fg-muted font-medium">{requirementText}</span>
                  <span className="text-warning-400 font-bold">
                    {labels.earnedBy(badge.earned_count)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
