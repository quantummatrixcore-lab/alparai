"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { approveQueueItem, rejectQueueItem } from "@/actions/ecosystem";
import { Clock, Check, X, ExternalLink, Loader2 } from "lucide-react";
import type { Database } from "@/types/database";

type QueueItem = Database["public"]["Tables"]["external_incidents_queue"]["Row"];

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    reddit: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    hn: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    rss: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    oecd: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    aiid: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
        colors[source?.toLowerCase()] || "border-white/10 bg-zinc-800 text-zinc-400"
      }`}
    >
      {source}
    </span>
  );
}

export function ApprovalQueue({ items: initialItems }: { items: QueueItem[] }) {
  const t = useTranslations("admin");
  const [items, setItems] = useState(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleApprove = (id: string) => {
    setPendingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await approveQueueItem(id);
      removeItem(id);
    });
  };

  const handleReject = (id: string) => {
    setPendingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await rejectQueueItem(id);
      removeItem(id);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-white uppercase">
              <span>{t("review_queue") || "Review Queue"}</span>
              {items.length > 0 && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-400">
                  {t("pending_badge", { count: items.length }) || `${items.length} BEKLEYEN`}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              {t("crawled_drafts_subtitle") ||
                "Crawled drafts from OECD, AIID, RSS feeds awaiting human moderation"}
            </p>
          </div>
        </div>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">{t("queue_empty") || "Queue is Empty"}</h4>
            <p className="mt-1 text-xs text-zinc-400">
              {t("queue_empty_desc") ||
                "All external incident drafts have been reviewed and moderated."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const isItemPending = pendingIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`group flex flex-col justify-between gap-4 p-5 transition-all sm:flex-row sm:items-center ${
                    isItemPending ? "pointer-events-none opacity-50" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <SourceBadge source={item.source || "crawl"} />
                      <span className="font-mono text-[10px] text-zinc-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>

                    {item.external_url ? (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link hover:text-brand-300 flex items-center gap-1.5 text-sm font-bold text-white transition-colors"
                      >
                        <span className="line-clamp-1">{item.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover/link:opacity-100" />
                      </a>
                    ) : (
                      <h4 className="line-clamp-1 text-sm font-bold text-white">{item.title}</h4>
                    )}

                    {item.body && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                        {item.body}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isItemPending}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      {isItemPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>{t("approve") || "Approve"}</span>
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isItemPending}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/20 disabled:opacity-40"
                    >
                      {isItemPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>{t("reject") || "Reject"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
