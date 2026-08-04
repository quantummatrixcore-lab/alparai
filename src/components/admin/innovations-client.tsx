"use client";

import { useState } from "react";
import {
  Lightbulb,
  RefreshCw,
  Loader2,
  Check,
  X,
  ExternalLink,
  Plus,
  CheckCircle,
  Flame,
  Info,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  updateExternalQueueStatus,
  acceptExternalIncident,
  triggerManualFetch,
  updateInnovationStatus,
  createInnovation,
  autoReviewAllPending,
} from "@/actions/innovations";
import type { ExternalIncidentQueueItem, StrategyInnovation } from "@/types";

interface ConnectorStatus {
  name: string;
  source: string;
  last_fetch: string;
  pending_count: number;
}

interface InnovationsClientProps {
  initialInnovations: StrategyInnovation[];
  initialQueue: ExternalIncidentQueueItem[];
  initialConnectors: ConnectorStatus[];
  locale: string;
}

export function InnovationsClient({
  initialInnovations,
  initialQueue,
  initialConnectors,
  locale,
}: InnovationsClientProps) {
  const t = useTranslations("admin");
  const [innovations, setInnovations] = useState<StrategyInnovation[]>(initialInnovations);
  const [queue, setQueue] = useState<ExternalIncidentQueueItem[]>(initialQueue);
  const connectors = initialConnectors;

  const [isFetching, setIsFetching] = useState(false);
  const [isAutoReviewing, setIsAutoReviewing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAutoReview = async () => {
    setIsAutoReviewing(true);
    try {
      const res = await autoReviewAllPending();
      if (res.success) {
        toast.success(res.message);
        window.location.reload();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("failed_to_auto_review"));
    } finally {
      setIsAutoReviewing(false);
    }
  };

  // Create Innovation Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  // Accept Incident Modal/Form State
  const [acceptingItem, setAcceptingItem] = useState<ExternalIncidentQueueItem | null>(null);
  const [incidentCategory, setIncidentCategory] = useState("hallucination");
  const [incidentSeverity, setIncidentSeverity] = useState("medium");

  const handleManualFetch = async () => {
    setIsFetching(true);
    try {
      const res = await triggerManualFetch();
      if (res.success) {
        toast.success(res.message);
        // Refresh page/state or show updated info
        window.location.reload();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("failed_to_trigger_fetch"));
    } finally {
      setIsFetching(false);
    }
  };

  const handleQueueStatus = async (id: string, status: "rejected" | "duplicate") => {
    try {
      const res = await updateExternalQueueStatus(id, status);
      if (res.success) {
        setQueue((prev) => prev.filter((item) => item.id !== id));
        toast.success(t("status_updated"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error_updating_status"));
    }
  };

  const handleAcceptIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingItem) return;

    try {
      const res = await acceptExternalIncident(
        acceptingItem.id,
        incidentCategory,
        incidentSeverity,
      );
      if (res.success) {
        setQueue((prev) => prev.filter((item) => item.id !== acceptingItem.id));
        setAcceptingItem(null);
        toast.success(t("incident_approved_and_published"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error_accepting_incident"));
    }
  };

  const handleToggleInnovationStatus = async (
    id: string,
    currentStatus: StrategyInnovation["status"],
  ) => {
    let nextStatus: StrategyInnovation["status"] = "idea";
    if (currentStatus === "idea") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "done";
    else nextStatus = "idea";

    try {
      const res = await updateInnovationStatus(id, nextStatus);
      if (res.success) {
        setInnovations((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status: nextStatus } : inv)),
        );
        toast.success(t("innovation_status_updated"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("failed_to_update_status"));
    }
  };

  const handleCreateInnovation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      const res = await createInnovation(newTitle.trim(), newDesc.trim(), newPriority);
      if (res.success) {
        setInnovations((prev) => [
          ...prev,
          {
            id: res.id,
            title: newTitle.trim(),
            description: newDesc.trim(),
            priority: newPriority,
            status: "idea",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setNewTitle("");
        setNewDesc("");
        setIsAdding(false);
        toast.success(t("new_innovation_added"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("error_adding_innovation"));
    }
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const priorityLabels = {
    low: t("low"),
    medium: t("medium"),
    high: t("high"),
    critical: t("critical"),
  };

  const statusLabels = {
    idea: t("idea"),
    in_progress: t("in_progress"),
    done: t("completed"),
  };

  const statusColors = {
    idea: "bg-neutral-800 text-neutral-400 border-neutral-700",
    in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };

  return (
    <div className="space-y-10">
      {/* Upper header action */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
            <Lightbulb className="text-brand-400 h-6 w-6 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
            {t("innovation_hub_data_pool")}
          </h1>
          <p className="text-fg-secondary mt-1 text-sm">
            {t("review_incidents_from_external_data_stre")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAutoReview}
            disabled={isAutoReviewing}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-500 hover:shadow-indigo-500/10"
          >
            {isAutoReviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            {t("ai_review")}
          </button>
          <button
            onClick={handleManualFetch}
            disabled={isFetching}
            className="bg-bg-tertiary hover:bg-bg-tertiary/80 flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t("trigger_data_fetch")}
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            {t("new_innovation")}
          </button>
        </div>
      </div>

      {/* Connectors Status Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {connectors.map((conn) => (
          <div
            key={conn.source}
            className="bg-bg-secondary/40 rounded-xl border border-white/10 p-5 shadow-sm backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-white">{conn.name}</h3>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {t("active")}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-fg-secondary">{t("pending_in_queue")}</span>
                <span className="font-mono font-bold text-white">{conn.pending_count}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-fg-secondary">{t("last_fetch")}</span>
                <span className="text-fg-muted font-mono">
                  {new Date(conn.last_fetch).toLocaleTimeString(locale)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Innovation addition Form Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateInnovation}
            className="bg-bg-secondary w-full max-w-lg space-y-4 rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white">{t("add_new_innovation")}</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-fg-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-fg-secondary block text-xs font-bold">{t("title")}</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-bg-primary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border px-3 py-2 text-sm text-white focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-fg-secondary block text-xs font-bold">
                {t("description")}
              </label>
              <textarea
                required
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="bg-bg-primary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border px-3 py-2 text-sm text-white focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-fg-secondary block text-xs font-bold">{t("priority")}</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as StrategyInnovation["priority"])}
                className="bg-bg-primary border-border-subtle w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="low">{t("low")}</option>
                <option value="medium">{t("medium")}</option>
                <option value="high">{t("high")}</option>
                <option value="critical">{t("critical")}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="border-border-subtle text-fg-primary rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
              >
                {t("add")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accept Incident Modal Form */}
      {acceptingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAcceptIncident}
            className="bg-bg-secondary w-full max-w-lg space-y-4 rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white">{t("approve_publish_incident")}</h3>
              <button
                type="button"
                onClick={() => setAcceptingItem(null)}
                className="text-fg-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-fg-secondary space-y-2 rounded-xl border border-white/5 bg-neutral-950/40 p-4 text-xs">
              <p className="text-sm font-bold text-white">{acceptingItem.title}</p>
              <p className="line-clamp-4">{acceptingItem.body}</p>
              <a
                href={acceptingItem.external_url}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 inline-flex items-center gap-1 hover:underline"
              >
                {t("original_source")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-fg-secondary block text-xs font-bold">{t("category")}</label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                  className="bg-bg-primary border-border-subtle w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="hallucination">{t("hallucination")}</option>
                  <option value="data_leak">{t("data_leak")}</option>
                  <option value="bias">{t("bias_discrimination")}</option>
                  <option value="security_flaw">{t("security_flaw")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-fg-secondary block text-xs font-bold">{t("severity")}</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value)}
                  className="bg-bg-primary border-border-subtle w-full rounded-lg border px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="low">{t("low")}</option>
                  <option value="medium">{t("medium")}</option>
                  <option value="high">{t("high")}</option>
                  <option value="critical">{t("critical")}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAcceptingItem(null)}
                className="border-border-subtle text-fg-primary rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                {t("approve_publish")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Left side queue, Right side Innovations */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Review Queue (8 cols on large screens) */}
        <div className="space-y-4 lg:col-span-7">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Flame className="h-5 w-5 text-amber-500" />
            {t("external_incidents_review_queue")} ({queue.length})
          </h2>

          <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="bg-bg-secondary/40 space-y-3 rounded-xl border border-white/10 p-4 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase">
                      {item.source}
                    </span>
                    <h4 className="mt-1.5 text-sm font-bold text-white">{item.title}</h4>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setAcceptingItem(item)}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-400 transition hover:bg-emerald-500/20"
                      title={t("approve")}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleQueueStatus(item.id, "duplicate")}
                      className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2 py-1.5 text-[10px] font-bold text-yellow-400 transition hover:bg-yellow-500/20"
                      title={t("mark_duplicate")}
                    >
                      {t("dup")}
                    </button>
                    <button
                      onClick={() => handleQueueStatus(item.id, "rejected")}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 transition hover:bg-red-500/20"
                      title={t("reject")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-fg-secondary line-clamp-3 text-xs whitespace-pre-wrap">
                  {item.body}
                </p>

                <div className="text-fg-muted flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[10px]">
                  <span>
                    {t("score")}
                    {item.source_score}
                  </span>
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 transition hover:text-white"
                  >
                    {t("go_to_source")} <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ))}

            {queue.length === 0 && (
              <div className="bg-bg-secondary/20 text-fg-muted space-y-2 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm">
                <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
                <p>{t("queue_clean_no_new_external_incidents")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Innovations Pinboard (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Info className="text-brand-400 h-5 w-5" />
            {t("future_innovation_board")}
          </h2>

          <div className="max-h-[600px] space-y-3 overflow-y-auto pr-2">
            {innovations.map((inv) => (
              <div
                key={inv.id}
                className="bg-bg-secondary/40 space-y-3 rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-sm font-bold text-white">{inv.title}</h4>
                  <button
                    onClick={() => handleToggleInnovationStatus(inv.id, inv.status)}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-bold transition hover:opacity-85",
                      statusColors[inv.status],
                    )}
                  >
                    {statusLabels[inv.status]}
                  </button>
                </div>
                <p className="text-fg-secondary text-xs leading-normal">{inv.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-fg-muted font-mono text-[10px] uppercase">
                    {t("priority_1")}
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      priorityColors[inv.priority],
                    )}
                  >
                    {priorityLabels[inv.priority]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
