"use client";

import { useTranslations } from "next-intl";

interface BudgetGaugeProps {
  totalMonthly: number;
  totalBudget: number;
}

export function BudgetGauge({ totalMonthly, totalBudget }: BudgetGaugeProps) {
  const t = useTranslations("finance");

  const percentUsed = totalBudget > 0 ? Math.round((totalMonthly / totalBudget) * 100) : 0;

  // SVG properties for circle
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentUsed, 100) / 100) * circumference;

  // Determine indicator color
  const getColorClass = () => {
    if (percentUsed >= 90) return "text-rose-500 stroke-rose-500";
    if (percentUsed >= 75) return "text-amber-500 stroke-amber-500";
    return "text-emerald-500 stroke-emerald-500";
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{t("overallBudgetUsage")}</h4>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("monthlyLimitTracker")}</p>

      <div className="relative mt-6 flex items-center justify-center">
        {/* Outer Circular SVG */}
        <svg height={radius * 2} width={radius * 2} className="-rotate-90 transform">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            className="text-zinc-100 dark:text-zinc-900"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={`transition-all duration-700 ease-in-out ${getColorClass()}`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Inner Text overlay */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{percentUsed}%</span>
          <span className="text-[10px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            {t("used")}
          </span>
        </div>
      </div>

      <div className="mt-6 flex w-full justify-between border-t border-zinc-100 pt-4 text-sm dark:border-zinc-900">
        <div className="w-1/2 border-r border-zinc-100 text-center dark:border-zinc-900">
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t("spent")}</span>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            ${totalMonthly.toFixed(2)}
          </span>
        </div>
        <div className="w-1/2 text-center">
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t("totalLimit")}</span>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50">
            ${totalBudget.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
