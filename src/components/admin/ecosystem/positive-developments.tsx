"use client";

import { useTranslations } from "next-intl";
import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import type { Database } from "@/types/database";

type EcosystemNews = Database["public"]["Tables"]["ecosystem_news"]["Row"];

export function PositiveDevelopments({ items }: { items: EcosystemNews[] }) {
  const t = useTranslations("admin");
  return (
    <div className="bg-bg-tertiary/80 border-border-subtle overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
      <div className="border-border-subtle flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="border-success-500/30 bg-success-500/10 flex h-8 w-8 items-center justify-center rounded-xl border">
            <Sparkles className="text-success-400 h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              {t("positive_developments") || "Positive Developments"}
            </h3>
            <p className="text-fg-muted text-xs">
              {t("positive_developments_subtitle") || "AI Safety wins, governance & alignment news"}
            </p>
          </div>
        </div>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldCheck className="mb-3 h-8 w-8 text-zinc-600" />
            <h4 className="text-sm font-bold text-white">
              {t("no_items_tracked") || "No Items Tracked"}
            </h4>
            <p className="text-fg-muted mt-1 text-xs">
              {t("no_items_tracked_desc") ||
                "Positive AI milestones and safety breakthroughs will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3.5 p-5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="border-success-500/30 bg-success-500/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
                  <Sparkles className="text-success-400 h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    {item.source && (
                      <span className="text-fg-disabled font-mono text-[10px]">{item.source}</span>
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
                      className="group/link hover:text-success-300 flex items-center gap-1.5 text-sm font-bold text-white transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
