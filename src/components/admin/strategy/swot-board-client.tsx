"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertSwotItemAction, deleteSwotItemAction } from "@/actions/strategy";
import { toast } from "sonner";
import type { SwotItem } from "@/types";

import { useTranslations } from "next-intl";

interface SwotBoardClientProps {
  initialItems: SwotItem[];
  isReadOnly: boolean;
  locale: string;
}

export function SwotBoardClient({
  initialItems,
  isReadOnly,
  locale: _locale,
}: SwotBoardClientProps) {
  const t = useTranslations("admin");
  const [items, setItems] = useState<SwotItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeItem, setActiveItem] = useState<Partial<SwotItem> | null>(null);

  // Categorize items
  const strengths = items.filter((i) => i.category === "strength");
  const weaknesses = items.filter((i) => i.category === "weakness");
  const opportunities = items.filter((i) => i.category === "opportunity");
  const threats = items.filter((i) => i.category === "threat");

  const handleOpenAdd = (category: SwotItem["category"]) => {
    if (isReadOnly) return;
    setActiveItem({
      category,
      title: "",
      description: "",
      weight: "medium",
      status: "active",
      action_plan: "",
      target_date: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SwotItem) => {
    if (isReadOnly) return;
    setActiveItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm(t("swot_delete_confirm"))) {
      return;
    }

    try {
      const res = await deleteSwotItemAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success(t("swot_item_deleted"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("swot_delete_failed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !activeItem || !activeItem.title) return;

    setIsSaving(true);
    try {
      const res = await upsertSwotItemAction({
        id: activeItem.id,
        category: activeItem.category!,
        title: activeItem.title,
        description: activeItem.description || null,
        weight: activeItem.weight || "medium",
        action_plan: activeItem.action_plan || null,
        target_date: activeItem.target_date || null,
        status: activeItem.status || "active",
      });

      if (res.success) {
        // Reload items list
        const newItem: SwotItem = {
          id: res.id,
          category: activeItem.category!,
          title: activeItem.title,
          description: activeItem.description || null,
          weight: activeItem.weight || "medium",
          action_plan: activeItem.action_plan || null,
          target_date: activeItem.target_date || null,
          status: activeItem.status || "active",
          owner_user_id: activeItem.owner_user_id || null,
          created_at: activeItem.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (activeItem.id) {
          setItems((prev) => prev.map((item) => (item.id === activeItem.id ? newItem : item)));
          toast.success(t("swot_item_updated"));
        } else {
          setItems((prev) => [...prev, newItem]);
          toast.success(t("swot_item_added"));
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("operation_failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuadrant = (
    title: string,
    category: SwotItem["category"],
    quadrantItems: SwotItem[],
    colors: { bg: string; border: string; text: string; heading: string },
  ) => {
    return (
      <div
        className={cn(
          "border-border-subtle bg-bg-secondary/40 flex flex-col rounded-2xl border p-5 backdrop-blur-sm",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={cn("text-sm font-black tracking-wider uppercase", colors.heading)}>
            {title} ({quadrantItems.length})
          </h2>
          {!isReadOnly && (
            <button
              onClick={() => handleOpenAdd(category)}
              className={cn(
                "rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white",
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[380px] flex-1 scrollbar-thin space-y-3 overflow-y-auto">
          {quadrantItems.length === 0 ? (
            <p className="text-fg-muted py-4 text-xs italic">{t("swot_no_items")}</p>
          ) : (
            quadrantItems.map((item) => (
              <div
                key={item.id}
                className="bg-bg-tertiary/20 group relative rounded-xl border border-white/5 p-3.5 transition hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm leading-snug font-bold text-white">{item.title}</h4>
                    {item.description && (
                      <p className="text-fg-muted mt-1 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded px-1 text-[9px] font-extrabold tracking-wider uppercase",
                        item.weight === "high"
                          ? "bg-red-500/10 text-red-400"
                          : item.weight === "medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-blue-500/10 text-blue-400",
                      )}
                    >
                      {item.weight === "high"
                        ? t("swot_weight_high")
                        : item.weight === "medium"
                          ? t("swot_weight_medium")
                          : t("swot_weight_low")}
                    </span>
                  </div>
                </div>

                {item.action_plan && (
                  <div className="mt-2.5 border-t border-white/5 pt-2">
                    <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                      {t("swot_action_plan")}
                    </span>
                    <p className="text-fg-muted/80 mt-0.5 text-xs leading-relaxed italic">
                      {item.action_plan}
                    </p>
                  </div>
                )}

                {item.target_date && (
                  <div className="text-fg-muted mt-2 flex items-center gap-1 text-[10px]">
                    <Calendar className="h-3 w-3" />
                    <span>{item.target_date}</span>
                  </div>
                )}

                {/* Edit/Delete overlay */}
                {!isReadOnly && (
                  <div className="bg-bg-secondary/90 absolute top-2 right-2 flex items-center gap-1 rounded-lg border border-white/5 px-1 py-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-fg-muted rounded p-1 transition hover:bg-white/5 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {renderQuadrant(t("swot_strengths"), "strength", strengths, {
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/10",
          text: "text-emerald-400",
          heading: "text-emerald-400",
        })}
        {renderQuadrant(t("swot_weaknesses"), "weakness", weaknesses, {
          bg: "bg-red-500/5",
          border: "border-red-500/10",
          text: "text-red-400",
          heading: "text-red-400",
        })}
        {renderQuadrant(t("swot_opportunities"), "opportunity", opportunities, {
          bg: "bg-blue-500/5",
          border: "border-blue-500/10",
          text: "text-blue-400",
          heading: "text-blue-400",
        })}
        {renderQuadrant(t("swot_threats"), "threat", threats, {
          bg: "bg-amber-500/5",
          border: "border-amber-500/10",
          text: "text-amber-400",
          heading: "text-amber-400",
        })}
      </div>

      {/* CRUD Dialog Modal */}
      {isModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-bg-secondary border-border-strong w-full max-w-lg rounded-2xl border p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white uppercase">
                {activeItem.id ? t("swot_edit_item") : t("swot_add_item")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-fg-muted rounded-lg p-1 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("swot_title_label")}
                </label>
                <input
                  type="text"
                  required
                  value={activeItem.title || ""}
                  onChange={(e) => setActiveItem({ ...activeItem, title: e.target.value })}
                  placeholder={
                    activeItem.category === "strength"
                      ? t("swot_placeholder_strength")
                      : t("swot_placeholder_weakness")
                  }
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("swot_description_label")}
                </label>
                <textarea
                  value={activeItem.description || ""}
                  onChange={(e) => setActiveItem({ ...activeItem, description: e.target.value })}
                  rows={2}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("swot_weight_label")}
                  </label>
                  <select
                    value={activeItem.weight}
                    onChange={(e) =>
                      setActiveItem({
                        ...activeItem,
                        weight: e.target.value as "low" | "medium" | "high",
                      })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="low">{t("swot_weight_low")}</option>
                    <option value="medium">{t("swot_weight_medium")}</option>
                    <option value="high">{t("swot_weight_high")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                    {t("swot_status_label")}
                  </label>
                  <select
                    value={activeItem.status}
                    onChange={(e) =>
                      setActiveItem({
                        ...activeItem,
                        status: e.target.value as "active" | "done" | "archived",
                      })
                    }
                    className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:ring-1 focus:outline-none"
                  >
                    <option value="active">{t("swot_status_active")}</option>
                    <option value="done">{t("swot_status_done")}</option>
                    <option value="archived">{t("swot_status_archived")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("swot_action_plan_label")}
                </label>
                <textarea
                  value={activeItem.action_plan || ""}
                  onChange={(e) => setActiveItem({ ...activeItem, action_plan: e.target.value })}
                  rows={2}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border px-4 py-2 text-sm text-white focus:ring-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block text-xs font-bold tracking-wider uppercase">
                  {t("swot_target_date_label")}
                </label>
                <input
                  type="date"
                  value={activeItem.target_date || ""}
                  onChange={(e) => setActiveItem({ ...activeItem, target_date: e.target.value })}
                  className="bg-bg-tertiary border-border-subtle focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border-border-subtle rounded-xl border px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/10 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("swot_saving")}
                    </>
                  ) : (
                    t("swot_save")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
