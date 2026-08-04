"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { runBenchTrEvaluationAction } from "@/actions/admin/run-bench-tr-evaluation";
import { PlayCircle } from "lucide-react";

export function BenchTrRunButton() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("admin");

  const handleRun = () => {
    startTransition(async () => {
      const result = await runBenchTrEvaluationAction();
      const toast = document.getElementById("benchtr-toast");
      if (!toast) return;
      const msg = toast.querySelector(".toast-msg");
      if (msg) {
        msg.textContent = result.ok
          ? (result.message ?? t("benchtr_run_success"))
          : (result.error ?? t("benchtr_run_error"));
      }
      toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
      toast.classList.add("opacity-100", "translate-y-0");
      setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
        toast.classList.remove("opacity-100", "translate-y-0");
      }, 5000);
    });
  };

  return (
    <>
      <button
        onClick={handleRun}
        disabled={isPending}
        className="border-brand-500/30 from-brand-500/20 via-brand-500/10 text-brand-300 shadow-brand-500/10 hover:border-brand-500/50 hover:bg-brand-500/25 relative inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r to-transparent px-4 py-2.5 text-xs font-bold tracking-wider uppercase shadow-lg backdrop-blur-md transition-all hover:text-white disabled:opacity-40"
      >
        <PlayCircle className={`text-brand-400 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        <span>{isPending ? t("benchtr_running") : t("benchtr_run_button")}</span>
      </button>

      <div
        id="benchtr-toast"
        className="pointer-events-none fixed right-6 bottom-6 z-50 flex translate-y-4 items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 px-5 py-3.5 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300"
      >
        <span className="toast-msg text-xs font-semibold text-white"></span>
      </div>
    </>
  );
}
