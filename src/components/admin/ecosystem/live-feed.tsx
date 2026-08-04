"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { archiveEcosystemNews } from "@/actions/ecosystem";
import { Radio, Archive, ExternalLink, Globe } from "lucide-react";
import type { Database } from "@/types/database";

type EcosystemNews = Database["public"]["Tables"]["ecosystem_news"]["Row"];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  incident: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
  positive_development: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  regulation: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  research: { bg: "bg-brand-500/15", text: "text-brand-300", border: "border-brand-500/30" },
  business: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30" },
};

export function LiveFeed({ items }: { items: EcosystemNews[] }) {
  const t = useTranslations("admin");
  const [, startTransition] = useTransition();

  const handleArchive = (id: string) => {
    startTransition(() => archiveEcosystemNews(id));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
            <Radio className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              {t("live_stream") || "Live Ecosystem Stream"}
            </h3>
            <p className="text-xs text-zinc-400">
              {t("live_stream_subtitle") ||
                "Published articles, governance news & research updates"}
            </p>
          </div>
        </div>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Globe className="mb-3 h-8 w-8 text-zinc-600" />
            <h4 className="text-sm font-bold text-white">
              {t("no_published_articles") || "No Published Articles"}
            </h4>
            <p className="mt-1 text-xs text-zinc-400">
              {t("no_published_articles_desc") ||
                "Approved news items and incidents will appear in this real-time stream."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const catStyle = CATEGORY_STYLES[item.category] || {
                bg: "bg-zinc-800",
                text: "text-zinc-400",
                border: "border-white/10",
              };
              return (
                <div
                  key={item.id}
                  className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {item.category.replace("_", " ")}
                      </span>

                      {item.source && (
                        <span className="font-mono text-[10px] text-zinc-500">{item.source}</span>
                      )}

                      {item.published_at && (
                        <span className="font-mono text-[10px] text-zinc-500">
                          {new Date(item.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link hover:text-brand-300 flex items-center gap-1.5 text-sm font-bold text-white transition-colors"
                      >
                        <span className="line-clamp-2">{item.title_en}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover/link:opacity-100" />
                      </a>
                    ) : (
                      <h4 className="line-clamp-2 text-sm font-bold text-white">{item.title_en}</h4>
                    )}

                    {item.summary_en && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                        {item.summary_en}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleArchive(item.id)}
                    title={t("archive_item")}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
