"use client";

import { cn } from "@/lib/utils";

interface LivePulseRingProps {
  status?: "healthy" | "warning" | "danger" | "idle";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const statusColors = {
  healthy: { ring: "bg-emerald-500", glow: "shadow-[0_0_12px_rgba(39,174,96,0.6)]" },
  warning: { ring: "bg-amber-500", glow: "shadow-[0_0_12px_rgba(243,156,18,0.6)]" },
  danger: { ring: "bg-rose-500", glow: "shadow-[0_0_12px_rgba(230,57,70,0.6)]" },
  idle: { ring: "bg-zinc-500", glow: "" },
};

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function LivePulseRing({
  status = "healthy",
  size = "md",
  label,
  className,
}: LivePulseRingProps) {
  const colors = statusColors[status];
  const dotSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colors.ring,
          )}
          style={{
            animationDuration: status === "healthy" ? "2s" : status === "warning" ? "1.5s" : "1s",
          }}
        />
        <span
          className={cn("relative inline-flex rounded-full", dotSize, colors.ring, colors.glow)}
        />
      </span>
      {label && <span className="text-fg-secondary text-xs font-semibold">{label}</span>}
    </div>
  );
}
