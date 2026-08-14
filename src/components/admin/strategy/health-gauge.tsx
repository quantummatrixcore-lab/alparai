"use client";
import { useTranslations } from "next-intl";

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  const t = useTranslations("admin");
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color and status text based on score
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-success-400";
  let bgColor = "bg-success-500/10";
  let border = "border-success-500/20";
  let statusText = "EXCELLENT";

  if (score < 50) {
    strokeColor = "stroke-red-500";
    textColor = "text-danger-400";
    bgColor = "bg-danger-500/10";
    border = "border-danger-500/20";
    statusText = "CRITICAL";
  } else if (score < 70) {
    strokeColor = "stroke-amber-500";
    textColor = "text-warning-400";
    bgColor = "bg-warning-500/10";
    border = "border-warning-500/20";
    statusText = "WARNING";
  } else if (score < 90) {
    strokeColor = "stroke-blue-500";
    textColor = "text-brand-400";
    bgColor = "bg-brand-500/10";
    border = "border-brand-500/20";
    statusText = "GOOD";
  }

  return (
    <div className="border-border-subtle bg-bg-secondary/40 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-xl backdrop-blur-md">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="fill-none stroke-white/5"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">{score}%</span>
          <span className="text-fg-muted mt-0.5 text-[9px] font-bold tracking-wider uppercase">
            {t("health_score")}
          </span>
        </div>
      </div>
      <div
        className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${bgColor} ${textColor} ${border}`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              score < 50
                ? "bg-danger-400"
                : score < 70
                  ? "bg-warning-400"
                  : score < 90
                    ? "bg-brand-400"
                    : "bg-success-400"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              score < 50
                ? "bg-danger-500"
                : score < 70
                  ? "bg-warning-500"
                  : score < 90
                    ? "bg-brand-500"
                    : "bg-success-500"
            }`}
          />
        </span>
        {statusText}
      </div>
    </div>
  );
}
