import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid = React.memo(function BentoGrid({
  className,
  children,
}: BentoGridProps) {
  return (
    <div
      role="list"
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-7xl mx-auto w-full auto-rows-auto md:auto-rows-[18rem]",
        className
      )}
    >
      {children}
    </div>
  );
});

export interface BentoGridItemProps {
  className?: string;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  neonColor?: "cyan" | "purple" | "emerald" | "rose" | "amber";
  onClick?: () => void;
  trackingId?: string;
}

const NEON_MAP = {
  cyan: "hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] border-cyan-500/20",
  purple: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border-purple-500/20",
  emerald: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] border-emerald-500/20",
  rose: "hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] border-rose-500/20",
  amber: "hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] border-amber-500/20",
} as const;

export const BentoGridItem = React.memo(function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  neonColor = "cyan",
  onClick,
  trackingId,
}: BentoGridItemProps) {
  return (
    <div
      role={onClick ? "button" : "listitem"}
      tabIndex={0}
      onClick={onClick}
      data-ph-capture={trackingId ? `bento-click-${trackingId}` : "bento-click"}
      className={cn(
        "row-span-1 rounded-[1.5rem] overflow-hidden group/bento transition-all duration-500 shadow-input dark:shadow-none p-5 sm:p-6 dark:bg-black/40 dark:border-white/[0.08] bg-white border border-transparent justify-between flex flex-col space-y-4 backdrop-blur-2xl glassmorphism min-w-0 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer",
        NEON_MAP[neonColor],
        className
      )}
    >
      {header && <div className="mb-2">{header}</div>}
      <div className="group-hover/bento:translate-x-1 sm:group-hover/bento:translate-x-2 transition duration-300 min-w-0 flex flex-col justify-end h-full">
        <div aria-hidden="true" className="text-xl sm:text-2xl mb-2 sm:mb-3 text-neutral-600 dark:text-neutral-200 opacity-80 group-hover/bento:opacity-100 transition-opacity">
          {icon}
        </div>
        <h3 className="font-sans font-bold text-base sm:text-lg text-neutral-800 dark:text-neutral-100 mb-1 sm:mb-2 break-words">
          {title}
        </h3>
        <p className="font-sans font-medium text-neutral-500 text-xs sm:text-sm dark:text-neutral-400 break-words leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
});
