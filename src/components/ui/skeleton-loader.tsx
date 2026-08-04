import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonLoaderProps {
  variant?: "card" | "list" | "chart" | "metric";
  count?: number;
  className?: string;
}

const variants = {
  card: (
    <div className="bg-bg-secondary border-border-subtle space-y-4 rounded-xl border p-6">
      <div className="bg-bg-tertiary h-4 w-3/4 animate-pulse rounded-md" />
      <div className="bg-bg-tertiary h-3 w-1/2 animate-pulse rounded-md" />
      <div className="flex gap-3">
        <div className="bg-bg-tertiary h-8 w-8 animate-pulse rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="bg-bg-tertiary h-3 w-full animate-pulse rounded-md" />
          <div className="bg-bg-tertiary h-3 w-2/3 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  ),
  list: (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-secondary border-border-subtle flex items-center gap-4 rounded-xl border p-4"
        >
          <div className="bg-bg-tertiary h-10 w-10 animate-pulse rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="bg-bg-tertiary h-3 w-3/4 animate-pulse rounded-md" />
            <div className="bg-bg-tertiary h-3 w-1/2 animate-pulse rounded-md" />
          </div>
        </div>
      ))}
    </div>
  ),
  chart: (
    <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-bg-tertiary h-4 w-32 animate-pulse rounded-md" />
        <div className="bg-bg-tertiary h-4 w-16 animate-pulse rounded-md" />
      </div>
      <div className="bg-bg-tertiary h-48 w-full animate-pulse rounded-lg" />
    </div>
  ),
  metric: (
    <div className="bg-bg-secondary border-border-subtle flex items-center gap-4 rounded-xl border p-4">
      <div className="bg-bg-tertiary h-10 w-10 animate-pulse rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="bg-bg-tertiary h-3 w-20 animate-pulse rounded-md" />
        <div className="bg-bg-tertiary h-6 w-16 animate-pulse rounded-md" />
      </div>
    </div>
  ),
};

export function SkeletonLoader({ variant = "card", count = 1, className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-4", className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{variants[variant]}</React.Fragment>
      ))}
    </div>
  );
}
