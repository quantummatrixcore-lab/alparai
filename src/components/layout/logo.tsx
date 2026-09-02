import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  xs: 18,
  sm: 24,
  md: 32,
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
      aria-label="ALPAR AI Logo"
      {...props}
    >
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block overflow-visible drop-shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-all duration-300 group-hover/logo:drop-shadow-[0_0_20px_rgba(37,99,235,0.6)]"
      >
        <defs>
          {/* Titanium Silver Chiseled Left Facet */}
          <linearGradient id="alpar-facet-titanium-comp" x1="20" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Electric Cobalt Prismatic Right Facet */}
          <linearGradient id="alpar-facet-cobalt-comp" x1="50" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Inner Refraction Core / Crossbeam */}
          <linearGradient id="alpar-facet-cyan-beam-comp" x1="30" y1="50" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Ambient Shadow Base */}
        <polygon points="50,12 14,88 86,88" fill="#030712" fillOpacity="0.4" />

        {/* Left Titanium Pillar */}
        <polygon
          points="50,12 16,88 34,88 50,48"
          fill="url(#alpar-facet-titanium-comp)"
          className="transition-all duration-300 group-hover/logo:brightness-110"
        />

        {/* Right Cobalt Prismatic Pillar */}
        <polygon
          points="50,12 50,48 66,88 84,88"
          fill="url(#alpar-facet-cobalt-comp)"
          className="transition-all duration-300 group-hover/logo:brightness-110"
        />

        {/* Inner Crossbar Optical Prism */}
        <polygon
          points="32,70 68,70 50,44"
          fill="url(#alpar-facet-cyan-beam-comp)"
          className="origin-center transition-transform duration-300 group-hover/logo:scale-105"
        />
        <polygon points="34,70 66,70 50,84" fill="#090d16" />

        {/* Precision Center Light Point */}
        <circle
          cx="50"
          cy="46"
          r="2.5"
          fill="#ffffff"
          className="transition-all duration-300 group-hover/logo:drop-shadow-[0_0_8px_#ffffff]"
        />
      </svg>
    </span>
  );
}
