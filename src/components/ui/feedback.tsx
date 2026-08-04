import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <Loader2
      className={cn("text-brand-500 animate-spin", sizeMap[size], className)}
      aria-label="Loading"
      role="status"
    />
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-bg-tertiary relative overflow-hidden rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-secondary/50 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-fg-muted text-4xl">{icon}</div>}
      <div className="space-y-1">
        <h3 className="text-fg-primary text-lg font-semibold">{title}</h3>
        {description && <p className="text-fg-muted max-w-md text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-danger-500/30 bg-danger-500/5 flex flex-col items-center justify-center gap-4 rounded-xl border p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <div className="space-y-1">
        <h3 className="text-fg-primary text-lg font-semibold">{title}</h3>
        {description && <p className="text-fg-muted max-w-md text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
