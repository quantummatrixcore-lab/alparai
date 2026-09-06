"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

interface ModelScoreDisplayProps {
  scoreOverall: number;
  scoreAccuracy?: number | null;
  scoreSafety?: number | null;
  scoreCreativity?: number | null;
  scoreSpeed?: number | null;
  scoreValue?: number | null;
  reviewsCount: number;
}

export function ModelScoreDisplay({
  scoreOverall,
  scoreAccuracy = 0,
  scoreSafety = 0,
  scoreCreativity = 0,
  scoreSpeed = 0,
  scoreValue = 0,
  reviewsCount,
}: ModelScoreDisplayProps) {
  const t = useTranslations("models");

  const dimensions = [
    { label: t("dimensions.accuracy"), value: scoreAccuracy || 0 },
    { label: t("dimensions.safety"), value: scoreSafety || 0 },
    { label: t("dimensions.creativity"), value: scoreCreativity || 0 },
    { label: t("dimensions.speed"), value: scoreSpeed || 0 },
    { label: t("dimensions.value"), value: scoreValue || 0 },
  ];

  return (
    <div className="border-border-subtle bg-bg-secondary/40 grid grid-cols-1 gap-6 rounded-2xl border p-6 backdrop-blur-md md:grid-cols-3">
      <div className="border-border-subtle flex flex-col items-center justify-center border-b p-4 text-center md:border-r md:border-b-0">
        <h3 className="text-fg-muted mb-2 text-sm font-semibold tracking-wider uppercase">
          {t("overall_score")}
        </h3>
        <div className="text-fg-primary mb-3 flex items-baseline gap-1 text-5xl font-extrabold">
          {scoreOverall.toFixed(1)}
          <span className="text-fg-muted text-lg font-normal">/5</span>
        </div>
        <div className="mb-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(scoreOverall)
                  ? "fill-brand-400 text-brand-400"
                  : "text-border-strong"
              }`}
            />
          ))}
        </div>
        <p className="text-fg-muted text-xs">{t("based_on", { count: reviewsCount })}</p>
      </div>

      <div className="col-span-2 flex flex-col justify-center gap-4">
        {dimensions.map((dim) => {
          const percentage = (dim.value / 5) * 100;
          return (
            <div key={dim.label} className="grid grid-cols-12 items-center gap-4">
              <span className="text-fg-secondary col-span-4 text-sm font-medium">{dim.label}</span>
              <div className="bg-bg-tertiary relative col-span-6 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="from-brand-500 to-brand-300 h-full rounded-full bg-gradient-to-r shadow-[0_0_8px_rgba(244,63,94,0.4)] transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-fg-primary col-span-2 text-right text-sm font-bold">
                {dim.value ? dim.value.toFixed(1) : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
