"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "bg-bg-tertiary/70 border-border-subtle/50 flex items-center gap-1 rounded-xl border p-1 shadow-inner backdrop-blur-md",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 select-none active:scale-[0.97]",
              "focus-visible:ring-brand-500 focus-visible:ring-offset-bg-tertiary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isActive
                ? "bg-bg-primary text-fg-primary border border-border-subtle shadow-md shadow-black/40"
                : "text-fg-muted hover:text-fg-primary hover:bg-white/5",
            )}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
