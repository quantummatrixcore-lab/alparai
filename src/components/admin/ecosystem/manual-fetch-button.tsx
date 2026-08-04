"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

export function ManualFetchButton() {
  const t = useTranslations("admin");
  const [isPending, startTransition] = useTransition();

  const handleFetch = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/ecosystem-fetch", {
          cache: "no-store",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        let result;
        try {
          result = await response.json();
        } catch (_e) {
          throw new Error(`API yanıtı okunamadı (Status: ${response.status})`);
        }

        if (!response.ok) {
          throw new Error(result?.message || `Sunucu hatası: ${response.status}`);
        }

        const toast = document.getElementById("fetch-toast");
        if (!toast) return;
        const msg = toast.querySelector(".toast-msg");
        const icon = toast.querySelector(".toast-icon");
        if (msg) msg.textContent = result.message;
        if (icon) {
          icon.innerHTML = result.success
            ? '<svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg class="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        }
        toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
        toast.classList.add("opacity-100", "translate-y-0");
        setTimeout(() => {
          toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
          toast.classList.remove("opacity-100", "translate-y-0");
        }, 5000);
      } catch (err) {
        const toast = document.getElementById("fetch-toast");
        if (!toast) return;
        const msg = toast.querySelector(".toast-msg");
        const icon = toast.querySelector(".toast-icon");
        if (msg)
          msg.textContent = `Ağ veya Sunucu Hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`;
        if (icon) {
          icon.innerHTML =
            '<svg class="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        }
        toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
        toast.classList.add("opacity-100", "translate-y-0");
        setTimeout(() => {
          toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
          toast.classList.remove("opacity-100", "translate-y-0");
        }, 5000);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleFetch}
        disabled={isPending}
        className="border-brand-500/30 from-brand-500/20 via-brand-500/10 text-brand-300 shadow-brand-500/10 hover:border-brand-500/50 hover:bg-brand-500/25 relative inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r to-transparent px-4 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg backdrop-blur-md transition-all hover:text-white disabled:opacity-40"
      >
        <RefreshCw className={`text-brand-400 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        <span>{isPending ? t("syncing_feed") : t("trigger_ai_crawler")}</span>
      </button>

      <div
        id="fetch-toast"
        className="pointer-events-none fixed right-6 bottom-6 z-50 flex translate-y-4 items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 px-5 py-3.5 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300"
      >
        <span className="toast-icon"></span>
        <span className="toast-msg text-xs font-semibold text-white"></span>
      </div>
    </>
  );
}
