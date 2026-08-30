"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "border-border-subtle/80 bg-bg-elevated/95 w-full rounded-2xl border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl animate-in zoom-in-95 duration-200",
          sizeMap[size],
          "max-h-[90vh] overflow-y-auto",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="space-y-1">
            {title && (
              <h2 id={titleId} className="text-fg-primary text-lg font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-fg-muted text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-fg-muted hover:text-fg-primary hover:bg-white/10 active:scale-95 focus-visible:ring-brand-500 focus-visible:ring-offset-bg-elevated rounded-xl p-1.5 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </div>
  );
}
