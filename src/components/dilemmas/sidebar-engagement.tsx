"use client";

import { motion } from "framer-motion";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

export type SidebarPollData = {
  id: string;
  title: string;
  yes_count: number;
  no_count: number;
  unsure_count: number;
};

export type SidebarNewsItem = {
  id: string;
  title_en: string;
  title_tr: string | null;
  source: string | null;
  severity: string;
  published_at: string;
};

const SEV_DOT: Record<string, string> = {
  critical: "bg-danger-500",
  high: "bg-warning-500",
  medium: "bg-brand-500",
  low: "bg-fg-muted",
};

export function SidebarEngagement({
  poll,
  news,
}: {
  poll: SidebarPollData | null;
  news: SidebarNewsItem[];
}) {
  const locale = useLocale();

  const totalVotes = poll ? poll.yes_count + poll.no_count + poll.unsure_count : 0;
  const yesPercent = totalVotes > 0 ? Math.round((poll!.yes_count / totalVotes) * 100) : 0;
  const noPercent = totalVotes > 0 ? Math.round((poll!.no_count / totalVotes) * 100) : 0;
  const unsurePercent = totalVotes > 0 ? 100 - yesPercent - noPercent : 0;

  const getTitle = (item: SidebarNewsItem) =>
    locale === "tr" && item.title_tr ? item.title_tr : item.title_en;

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-[300px]">
      {/* Poll Widget */}
      {poll && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-bg-secondary border-brand-500/20 rounded-xl border p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded-sm border px-2 py-0.5 text-[10px] font-black tracking-[0.2em] uppercase">
              {locale === "tr" ? "Canlı Anket" : "Live Poll"}
            </span>
          </div>
          <h3 className="text-fg-primary mb-4 text-sm leading-snug font-bold">{poll.title}</h3>

          <div className="space-y-1.5">
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

          <p className="text-fg-muted mt-2 text-center text-[11px]">
            {totalVotes.toLocaleString()} {locale === "tr" ? "oy" : "votes"}
          </p>

          <Link
            href="/#poll"
            className="bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/30 text-brand-400 mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition-all"
          >
            {locale === "tr" ? "Oyunuzu Kullanın" : "Cast Your Vote"}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      {/* News Widget */}
      {news.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-bg-secondary border-fg-muted/10 rounded-xl border p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand-400 h-4 w-4" />
              <span className="text-fg-primary text-xs font-black tracking-wider uppercase">
                {locale === "tr" ? "Son Haberler" : "Latest News"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {news.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[item.severity] ?? "bg-fg-muted"}`}
                />
                <p className="text-fg-secondary hover:text-fg-primary line-clamp-2 cursor-pointer text-xs leading-snug transition-colors">
                  {getTitle(item)}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/#ecosystem"
            className="text-brand-400 hover:text-brand-300 mt-3 flex items-center gap-1 text-[11px] font-bold transition-colors"
          >
            {locale === "tr" ? "Tüm haberler" : "All news"}
            <ChevronRight className="h-3 w-3" />
          </Link>
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
      <div className="bg-bg-tertiary relative h-4 flex-1 overflow-hidden rounded-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-sm ${colorClass}`}
        />
        {pct > 0 && (
          <span className="absolute top-1/2 right-1 -translate-y-1/2 text-[10px] font-bold text-white/80">
            %{pct}
          </span>
        )}
      </div>
    </div>
  );
}
