"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Award, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import type { LeaderboardEntry } from "@/types";

export type SidebarNewsItem = {
  id: string;
  title_en: string;
  title_tr: string | null;
  source: string | null;
  severity: string;
  published_at: string;
};

export type SidebarPollData = {
  id: string;
  title: string;
  yes_count: number;
  no_count: number;
  unsure_count: number;
};

const SEV_DOT: Record<string, string> = {
  critical: "bg-danger-500",
  high: "bg-warning-500",
  medium: "bg-brand-500",
  low: "bg-fg-muted",
};

interface FeedSidebarProps {
  leaderboard: LeaderboardEntry[];
  news: SidebarNewsItem[];
  poll: SidebarPollData | null;
}

export function FeedSidebar({ leaderboard, news, poll }: FeedSidebarProps) {
  const locale = useLocale();

  const totalVotes = poll ? poll.yes_count + poll.no_count + poll.unsure_count : 0;
  const yesPercent = totalVotes > 0 ? Math.round((poll!.yes_count / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((poll!.no_count / totalVotes) * 100) : 0;
  const unsurePercent = totalVotes > 0 ? 100 - yesPercent - noPercent : 0;

  const getTitle = (item: SidebarNewsItem) =>
    locale === "tr" && item.title_tr ? item.title_tr : item.title_en;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[320px]">
      {/* Manifesto/Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-500/5 border-brand-500/20 rounded-2xl border p-5"
      >
        <div className="bg-brand-500/10 text-brand-400 flex h-8 w-8 items-center justify-center rounded-lg">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h3 className="text-fg-primary mt-3 text-sm font-black tracking-wider uppercase">
          {locale === "tr" ? "Güven Altyapısı" : "Trust Infrastructure"}
        </h3>
        <p className="text-fg-secondary mt-2 text-xs leading-relaxed font-medium">
          {locale === "tr"
            ? "ALPAR AI, yapay zeka sistemlerinin gerçek dünyadaki davranışlarını ve hatalarını belgeleyen bağımsız bir kamu arşividir."
            : "ALPAR AI is an independent public record documenting the real-world behavior and failures of AI systems."}
        </p>
      </motion.div>

      {/* Mini Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-warning-400 h-4 w-4" />
            <span className="text-fg-primary text-xs font-black tracking-wider uppercase">
              {locale === "tr" ? "En Güvenilir Sağlayıcılar" : "Top Trusted Providers"}
            </span>
          </div>
          <Link
            href="/leaderboard"
            className="text-brand-400 hover:text-brand-300 text-[10px] font-bold tracking-wider uppercase transition-colors"
          >
            {locale === "tr" ? "Tümü" : "All"}
          </Link>
        </div>

        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((item, idx) => (
            <div key={item.provider_id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-fg-muted w-4 text-right font-bold">{idx + 1}.</span>
                <span className="text-fg-secondary font-semibold">{item.provider_name}</span>
              </div>
              <span
                className={`font-black ${
                  (item.trust_score ?? 70) >= 80 ? "text-success-400" : "text-warning-400"
                }`}
              >
                {item.trust_score ?? 70}/100
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Poll Widget */}
      {poll && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-5"
        >
          <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded-md border px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase">
            {locale === "tr" ? "Canlı Anket" : "Live Poll"}
          </span>
          <h3 className="text-fg-primary mt-3 mb-4 text-xs leading-normal font-bold">
            {poll.title}
          </h3>

          <div className="space-y-2">
            <VoteBar
              label={locale === "tr" ? "Evet" : "Yes"}
              pct={yesPercent}
              colorClass="bg-success-500/80"
              textClass="text-success-400"
            />
            <VoteBar
              label={locale === "tr" ? "Emin Değilim" : "Unsure"}
              pct={unsurePercent}
              colorClass="bg-fg-muted/40"
              textClass="text-fg-muted"
            />
            <VoteBar
              label={locale === "tr" ? "Hayır" : "No"}
              pct={noPercent}
              colorClass="bg-danger-500/80"
              textClass="text-danger-400"
            />
          </div>

          <p className="text-fg-muted mt-3 text-center text-[10px]">
            {totalVotes.toLocaleString()} {locale === "tr" ? "oy" : "votes"}
          </p>
        </motion.div>
      )}

      {/* News Widget */}
      {news.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-secondary/40 rounded-2xl border border-white/5 p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-brand-400 h-4 w-4" />
            <span className="text-fg-primary text-xs font-black tracking-wider uppercase">
              {locale === "tr" ? "Son Gelişmeler" : "Latest News"}
            </span>
          </div>

          <div className="space-y-3">
            {news.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[item.severity] ?? "bg-fg-muted"}`}
                />
                <p className="text-fg-secondary hover:text-brand-400 line-clamp-2 cursor-pointer text-[11px] leading-snug transition-colors">
                  {getTitle(item)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}

function VoteBar({
  label,
  pct,
  colorClass,
  textClass,
}: {
  label: string;
  pct: number;
  colorClass: string;
  textClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-16 text-right text-[10px] font-bold ${textClass}`}>{label}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-sm border border-white/10 bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-sm ${colorClass}`}
        />
        {pct > 0 && (
          <span className="absolute top-1/2 right-1 -translate-y-1/2 text-[9px] font-bold text-white/80">
            %{pct}
          </span>
        )}
      </div>
    </div>
  );
}
