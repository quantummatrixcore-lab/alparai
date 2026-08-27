"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { archiveEcosystemNews } from "@/actions/ecosystem";
import { Radio, Archive, ExternalLink, Globe } from "lucide-react";
import type { Database } from "@/types/database";

type EcosystemNews = Database["public"]["Tables"]["ecosystem_news"]["Row"];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  incident: { bg: "bg-danger-500/15", text: "text-danger-400", border: "border-danger-500/30" },
  positive_development: {
    bg: "bg-success-500/15",
    text: "text-success-400",
    border: "border-success-500/30",
  },
  regulation: {
    bg: "bg-warning-500/15",
    text: "text-warning-400",
    border: "border-warning-500/30",
  },
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
    <div className="bg-bg-tertiary/80 border-border-subtle overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
      <div className="border-border-subtle flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
            <Radio className="h-4 w-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              {t("live_stream") || "Live Ecosystem Stream"}
            </h3>
            <p className="text-fg-muted text-xs">
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
            <p className="text-fg-muted mt-1 text-xs">
              {t("no_published_articles_desc") ||
                "Approved news items and incidents will appear in this real-time stream."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const catStyle = CATEGORY_STYLES[item.category] || {
                bg: "bg-bg-elevated",
                text: "text-fg-muted",
                border: "border-border-subtle",
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
                        <span className="text-fg-disabled font-mono text-[10px]">
                          {item.source}
                        </span>
                      )}

                      {item.published_at && (
                        <span className="text-fg-disabled font-mono text-[10px]">
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
                      <p className="text-fg-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                        {item.summary_en}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleArchive(item.id)}
                    title={t("archive_item")}
                    className="text-fg-muted hover:border-danger-500/30 hover:bg-danger-500/10 hover:text-danger-400 border-border-subtle flex h-8 w-8 items-center justify-center rounded-xl border bg-white/5 transition-colors"
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
