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
      className={cn("bg-bg-tertiary flex items-center gap-1 rounded-xl p-1", className)}
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
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200",
              isActive
                ? "bg-bg-primary text-fg-primary shadow-sm"
                : "text-fg-muted hover:text-fg-primary",
            )}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
