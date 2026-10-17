import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  xs: 20,
  sm: 26,
  md: 34,
  lg: 48,
  xl: 96,
} as const;

export function Logo({ className, size = "md", ...props }: LogoProps) {
  const px = sizeMap[size];
  return (
    <span
      className={cn(
        "group/logo relative inline-flex shrink-0 items-center justify-center select-none",
        className,
      )}
      style={{ width: px, height: px }}
      role="img"
      aria-label="ALPAR AI Official Logo"
      {...props}
    >
      <Image
        src="/brand/alpar-shield-emblem.png"
        alt="ALPAR AI Shield"
        width={px * 2}
        height={px * 2}
        className="h-full w-full object-contain rounded-full drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:drop-shadow-[0_0_20px_rgba(0,242,254,0.6)]"
        priority
      />
    </span>
  );
}
