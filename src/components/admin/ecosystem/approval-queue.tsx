"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { approveQueueItem, rejectQueueItem } from "@/actions/ecosystem";
import { Clock, Check, X, ExternalLink, Loader2 } from "lucide-react";
import type { Database } from "@/types/database";

type QueueItem = Database["public"]["Tables"]["external_incidents_queue"]["Row"];

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    reddit: "bg-warning-500/15 text-warning-400 border-warning-500/30",
    hn: "bg-warning-500/15 text-warning-400 border-warning-500/30",
    rss: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    oecd: "bg-brand-500/15 text-brand-400 border-brand-500/30",
    aiid: "bg-danger-500/15 text-danger-400 border-danger-500/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
        colors[source?.toLowerCase()] || "text-fg-muted border-white/10 bg-zinc-800"
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
    <div className="bg-bg-tertiary/80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="border-warning-500/30 bg-warning-500/10 flex h-8 w-8 items-center justify-center rounded-xl border">
            <Clock className="text-warning-400 h-4 w-4" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-white uppercase">
              <span>{t("review_queue") || "Review Queue"}</span>
              {items.length > 0 && (
                <span className="border-warning-500/30 bg-warning-500/20 text-warning-400 rounded-full border px-2 py-0.5 text-[11px] font-extrabold">
                  {t("pending_badge", { count: items.length }) || `${items.length} BEKLEYEN`}
                </span>
              )}
            </h3>
            <p className="text-fg-muted text-xs">
              {t("crawled_drafts_subtitle") ||
                "Crawled drafts from OECD, AIID, RSS feeds awaiting human moderation"}
            </p>
          </div>
        </div>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="border-success-500/30 bg-success-500/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full border">
              <Check className="text-success-400 h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">{t("queue_empty") || "Queue is Empty"}</h4>
            <p className="text-fg-muted mt-1 text-xs">
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
                      <span className="text-fg-disabled font-mono text-[10px]">
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
                      <p className="text-fg-muted mt-1 line-clamp-2 text-xs leading-relaxed">
                        {item.body}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isItemPending}
                      className="border-success-500/30 bg-success-500/10 text-success-400 hover:border-success-500/50 hover:bg-success-500/20 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40"
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
                      className="border-danger-500/30 bg-danger-500/10 text-danger-400 hover:border-danger-500/50 hover:bg-danger-500/20 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40"
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
