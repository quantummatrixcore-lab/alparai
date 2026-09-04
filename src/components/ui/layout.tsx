import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  size = "default",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "narrow" | "wide" | "full";
}) {
  const sizeMap = {
    default: "max-w-7xl",
    narrow: "max-w-3xl",
    wide: "max-w-[1400px]",
    full: "max-w-none",
  };
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeMap[size], className)} {...props}>
      {children}
    </div>
  );
}

export function Section({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const safeClassName = className?.replace(/\breveal-on-scroll\b/g, "");
  return (
    <section className={cn("py-16 md:py-24", safeClassName)} {...props}>
      {children}
    </section>
  );
}

const gapClasses = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
} as const;

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

export function Stack({
  direction = "column",
  gap = 4,
  align,
  justify,
  wrap,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  direction?: "row" | "column";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row",
        gapClasses[gap] ?? "gap-4",
        align && alignClasses[align],
        justify && justifyClasses[justify],
        wrap && "flex-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Divider({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border-subtle",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
