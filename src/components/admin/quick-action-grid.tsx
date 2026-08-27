"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
}

export interface QuickActionGridProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const variantClasses = {
  default: "bg-bg-secondary border-border-subtle hover:border-brand-500/30 hover:bg-brand-500/5",
  danger: "bg-danger-500/5 border-danger-500/20 hover:border-danger-500/40 hover:bg-danger-500/10",
  success:
    "bg-success-500/5 border-success-500/20 hover:border-success-500/40 hover:bg-success-500/10",
};

const iconVariantClasses = {
  default: "text-brand-400",
  danger: "text-danger-400",
  success: "text-success-400",
};

export function QuickActionGrid({ actions, columns = 2, className }: QuickActionGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 md:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? "default";
        return (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 active:scale-[0.97]",
              variantClasses[variant],
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                iconVariantClasses[variant],
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <span className="text-fg-primary text-sm leading-tight font-semibold">
              {action.label}
            </span>
            {action.description && (
              <span className="text-fg-muted text-[10px] leading-tight">{action.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
