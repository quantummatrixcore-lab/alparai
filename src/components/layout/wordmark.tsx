import * as React from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export interface WordmarkProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
}

const sizeMap = {
  sm: { logo: "sm" as const, text: "text-base" },
  md: { logo: "md" as const, text: "text-xl" },
  lg: { logo: "lg" as const, text: "text-3xl" },
};

export function Wordmark({
  className,
  size = "md",
  showTagline = false,
  tagline,
  ...props
}: WordmarkProps) {
  const { logo, text } = sizeMap[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <Logo size={logo} />
      <div className="flex flex-col leading-none">
        <span className={cn("flex items-center gap-1.5 font-bold tracking-tight", text)}>
          <span className="to-brand-100 bg-gradient-to-r from-white via-slate-100 bg-clip-text text-transparent">
            ALPAR
          </span>
          <span className="from-accent-300 to-accent-500 bg-gradient-to-r bg-clip-text text-transparent">
            AI
          </span>
        </span>
        {showTagline && (
          <span className="text-fg-muted mt-0.5 text-[10px] tracking-widest uppercase">
            {tagline ?? "Trust Infrastructure"}
          </span>
        )}
      </div>
    </div>
  );
}
