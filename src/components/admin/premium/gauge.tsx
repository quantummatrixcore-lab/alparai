"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  variant?: "default" | "success" | "warning" | "danger" | "brand";
  showValue?: boolean;
  className?: string;
}

function getColor(variant: string, value: number): string {
  if (variant === "success") return "#27ae60";
  if (variant === "warning") return "#f39c12";
  if (variant === "danger") return "#e63946";
  if (variant === "brand") return "#a855f7";
  if (value >= 90) return "#27ae60";
  if (value >= 70) return "#f39c12";
  return "#e63946";
}

function getGlowColor(color: string): string {
  return `${color}40`;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 6, fontSize: "text-lg", labelSize: "text-[9px]" },
  md: { width: 120, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-[10px]" },
  lg: { width: 160, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-xs" },
};

export function Gauge({
  value,
  max = 100,
  size = "md",
  label,
  sublabel,
  variant = "default",
  showValue = true,
  className,
}: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const config = sizeConfig[size];
  const percentage = Math.min((value / max) * 100, 100);
  const color = getColor(variant, percentage);
  const glowColor = getGlowColor(color);

  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(eased * percentage);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [percentage]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          viewBox={`0 0 ${config.width} ${config.width}`}
          className="rotate-[-90deg]"
        >
          <defs>
            <filter id={`glow-${size}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={config.strokeWidth}
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${size})`}
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-mono font-black text-white", config.fontSize)}>
              {Math.round(animatedValue)}
            </span>
            {sublabel && (
              <span className={cn("text-fg-muted font-mono", config.labelSize)}>{sublabel}</span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="text-fg-secondary text-center text-xs font-bold tracking-wider uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
