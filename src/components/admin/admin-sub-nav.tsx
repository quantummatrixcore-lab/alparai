"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SubNavItem {
  id: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

export interface AdminSubNavProps {
  items: SubNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AdminSubNav({ items, activeId, onChange, className }: AdminSubNavProps) {
  return (
    <div className={cn("no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1", className)}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150",
              isActive
                ? "border-accent-500/30 bg-accent-500/15 text-accent-400 border shadow-sm"
                : "text-fg-muted hover:text-fg-primary hover:bg-bg-tertiary/60 border border-transparent",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-accent-500/25 text-accent-300" : "bg-bg-tertiary text-fg-muted",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
