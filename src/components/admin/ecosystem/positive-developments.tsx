"use client";

import { useTranslations } from "next-intl";
import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import type { Database } from "@/types/database";

type EcosystemNews = Database["public"]["Tables"]["ecosystem_news"]["Row"];

export function PositiveDevelopments({ items }: { items: EcosystemNews[] }) {
  const t = useTranslations("admin");
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              {t("positive_developments") || "Positive Developments"}
            </h3>
            <p className="text-xs text-zinc-400">
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
            <p className="mt-1 text-xs text-zinc-400">
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
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
                      className="group/link flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-emerald-300"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
