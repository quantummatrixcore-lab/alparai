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
        className="block overflow-visible drop-shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all duration-300 group-hover/logo:drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
      >
        <defs>
          {/* Primary Sentinel Left Wing Gradient */}
          <linearGradient
            id="alpar-wing-left"
            x1="15"
            y1="12"
            x2="50"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="40%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Primary Sentinel Right Wing Gradient */}
          <linearGradient
            id="alpar-wing-right"
            x1="85"
            y1="12"
            x2="50"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Monogram 'A' Apex & Crossbar Glow */}
          <linearGradient
            id="alpar-core-beam"
            x1="30"
            y1="30"
            x2="70"
            y2="70"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Core Starburst Glow */}
          <linearGradient
            id="alpar-spark"
            x1="45"
            y1="45"
            x2="55"
            y2="55"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Precision Neon Glow Filter */}
          <filter id="alpar-neon-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Sentinel Armor / Left Wing (Faceted Poly) */}
        <path
          d="M 50,8 L 16,24 V 52 C 16,73 34,88 50,94 V 58 L 32,58 L 50,22 Z"
          fill="url(#alpar-wing-left)"
          fillOpacity="0.95"
          className="transition-all duration-300 group-hover/logo:brightness-110"
        />

        {/* Outer Sentinel Armor / Right Wing (Faceted Poly) */}
        <path
          d="M 50,8 L 84,24 V 52 C 84,73 66,88 50,94 V 58 L 68,58 L 50,22 Z"
          fill="url(#alpar-wing-right)"
          fillOpacity="0.9"
          className="transition-all duration-300 group-hover/logo:brightness-110"
        />

        {/* Center Isometric Monogram 'A' Core Apex */}
        <path
          d="M 50,22 L 64,52 H 36 L 50,22 Z"
          fill="url(#alpar-core-beam)"
          fillOpacity="0.85"
          filter="url(#alpar-neon-bloom)"
          className="origin-center transition-transform duration-500 group-hover/logo:scale-105"
        />

        {/* Central Triangle Negative Space Cut */}
        <path d="M 50,33 L 57,48 H 43 L 50,33 Z" fill="#060913" />

        {/* Digital Balance Crossbar / Scale Beam */}
        <rect
          x="28"
          y="55"
          width="44"
          height="4.5"
          rx="2.25"
          fill="#ffffff"
          fillOpacity="0.95"
          filter="url(#alpar-neon-bloom)"
          className="origin-center transition-all duration-300 group-hover/logo:scale-x-110"
        />

        {/* Core Radiance Sparkle (Pulsing Star) */}
        <path
          d="M 50,44 L 51.8,48.2 L 56,50 L 51.8,51.8 L 50,56 L 48.2,51.8 L 44,50 L 48.2,48.2 Z"
          fill="url(#alpar-spark)"
          filter="url(#alpar-neon-bloom)"
          className="origin-center transition-transform duration-700 group-hover/logo:scale-125 group-hover/logo:rotate-90"
        />
      </svg>
    </span>
  );
}
