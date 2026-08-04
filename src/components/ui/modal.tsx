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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "border-border-subtle bg-bg-elevated w-full rounded-xl border shadow-2xl",
          sizeMap[size],
          "max-h-[90vh] overflow-y-auto",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="space-y-1">
            {title && (
              <h2 id="modal-title" className="text-fg-primary text-lg font-semibold">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="text-fg-muted text-sm">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-fg-muted hover:text-fg-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </div>
  );
}
