import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: { w: 24, h: 24 },
  md: { w: 32, h: 32 },
  lg: { w: 48, h: 48 },
  xl: { w: 96, h: 96 },
} as const;

export function Logo({ className, size = "md", ...props }: LogoProps) {
  const { w, h } = sizeMap[size];
  return (
    <span
      className={cn("group/logo relative inline-block shrink-0 select-none", className)}
      style={{ width: w, height: h }}
      role="img"
      aria-label="ALPAR AI"
      {...props}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full overflow-visible"
      >
        <defs>
          {/* Main Shield Gradient (Violet/Fuchsia to Indigo/Blue) */}
          <linearGradient
            id="logo-shield-grad-1"
            x1="20"
            y1="15"
            x2="80"
            y2="85"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Overlay Shield Gradient (Cyan to Slate/Dark) */}
          <linearGradient
            id="logo-shield-grad-2"
            x1="80"
            y1="15"
            x2="20"
            y2="85"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Central AI Core Glow Gradient */}
          <linearGradient
            id="logo-glow-grad"
            x1="50"
            y1="35"
            x2="50"
            y2="65"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Core Glow Filter */}
          <filter id="logo-core-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Shield Facets (Symmetric & Futuristic) */}
        {/* Left Shield Facet */}
        <path
          d="M 50,12 L 20,25 V 50 C 20,70 38,83 50,88 Z"
          fill="url(#logo-shield-grad-1)"
          fillOpacity="0.85"
          className="group-hover/logo:fill-opacity-95 transition-all duration-500"
        />

        {/* Right Shield Facet (Refractive Overlay) */}
        <path
          d="M 50,12 L 80,25 V 50 C 80,70 62,83 50,88 Z"
          fill="url(#logo-shield-grad-2)"
          fillOpacity="0.7"
          className="group-hover/logo:fill-opacity-80 transition-all duration-500"
        />

        {/* Cyber Inner Accent Line */}
        <path
          d="M 50,18 L 26,29 V 49 C 26,65 40,76 50,81 V 18"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.15"
          strokeLinecap="round"
          className="group-hover/logo:stroke-opacity-30 transition-all duration-500"
        />

        {/* Glowing AI Core Diamond */}
        <path
          d="M 50,36 L 62,50 L 50,64 L 38,50 Z"
          fill="url(#logo-glow-grad)"
          filter="url(#logo-core-glow)"
          className="origin-center transition-all duration-500 group-hover/logo:scale-110"
        />

        {/* Core Starburst (Inner Clarity Spark) */}
        <path
          d="M 50,42 L 52.5,47.5 L 58,50 L 52.5,52.5 L 50,58 L 47.5,52.5 L 42,50 L 47.5,47.5 Z"
          fill="#ffffff"
          className="origin-center transition-all duration-700 group-hover/logo:rotate-95"
        />
      </svg>
    </span>
  );
}
