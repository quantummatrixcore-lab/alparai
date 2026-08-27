"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SlideOverPanel({ open, onClose, title, children, className }: SlideOverPanelProps) {
  const titleId = React.useId();

  if (!open) return null;

  return (
    <>
      <div
        className="animate-in fade-in fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "bg-bg-secondary animate-in slide-in-from-right border-border-subtle/50 fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl transition-all duration-300 ease-in-out",
          className,
        )}
      >
        <div className="border-border-subtle/50 flex h-16 shrink-0 items-center justify-between border-b px-6">
          {title && (
            <h2 id={titleId} className="text-fg-primary text-lg font-bold">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="text-fg-muted hover:text-fg-primary focus-visible:ring-brand-500 focus-visible:ring-offset-bg-secondary -mr-2 rounded-xl p-2 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </>
  );
}
