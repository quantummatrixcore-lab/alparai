"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-4 bottom-20 z-30 flex h-9 w-9 items-center justify-center rounded-full sm:right-6 sm:bottom-6 sm:h-10 sm:w-10",
        "bg-bg-elevated border-border-strong text-fg-primary border shadow-2xl backdrop-blur-md",
        "hover:border-brand-500 hover:text-brand-400 hover:scale-105 active:scale-95",
        "focus-visible:ring-brand-500 focus-visible:ring-offset-bg-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "transition-all",
      )}
      aria-label="Scroll to top"
    >
      <ChevronDown className="h-4 w-4 rotate-180 sm:h-5 sm:w-5" aria-hidden="true" />
    </button>
  );
}
