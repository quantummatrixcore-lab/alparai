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
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-6 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full",
        "bg-bg-elevated border-border-strong text-fg-primary border",
        "hover:border-brand-500 hover:text-brand-400",
        "shadow-xl transition-all",
      )}
      aria-label="Scroll to top"
    >
      <ChevronDown className="h-5 w-5 rotate-180" />
    </button>
  );
}
