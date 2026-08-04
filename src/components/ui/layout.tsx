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
  return (
    <section className={cn("py-12 md:py-16 lg:py-20", className)} {...props}>
      {children}
    </section>
  );
}

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
        `gap-${gap}`,
        align && `items-${align}`,
        justify && `justify-${justify}`,
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
