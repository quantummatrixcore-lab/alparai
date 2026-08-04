import * as React from "react";
import { useTranslations } from "next-intl";

export function IncidentHeatmap() {
  const t = useTranslations("admin");
  const days = [
    t("heatmap_day_mon", { defaultValue: "Mon" }),
    t("heatmap_day_tue", { defaultValue: "Tue" }),
    t("heatmap_day_wed", { defaultValue: "Wed" }),
    t("heatmap_day_thu", { defaultValue: "Thu" }),
    t("heatmap_day_fri", { defaultValue: "Fri" }),
    t("heatmap_day_sat", { defaultValue: "Sat" }),
    t("heatmap_day_sun", { defaultValue: "Sun" }),
  ];
  const categories = [
    t("heatmap_cat_security", { defaultValue: "Security" }),
    t("heatmap_cat_privacy", { defaultValue: "Privacy" }),
    t("heatmap_cat_bias", { defaultValue: "Bias" }),
    t("heatmap_cat_hallucination", { defaultValue: "Hallucination" }),
    t("heatmap_cat_other", { defaultValue: "Other" }),
  ];

  // Heat values representing incident frequency/severity on each day of the week
  const data = [
    [1, 2, 0, 4, 1, 0, 2], // Security
    [3, 0, 1, 2, 0, 1, 0], // Privacy
    [0, 1, 3, 0, 2, 0, 1], // Bias
    [4, 2, 1, 3, 1, 2, 3], // Hallucination
    [1, 1, 0, 1, 0, 0, 1], // Other
  ];

  const getColorClass = (val: number) => {
    switch (val) {
      case 0:
        return "bg-white/[0.02] border-white/5 hover:bg-white/10";
      case 1:
        return "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20";
      case 2:
        return "bg-cyan-500/30 border-cyan-500/40 hover:bg-cyan-500/40";
      case 3:
        return "bg-cyan-500/60 border-cyan-500/70 hover:bg-cyan-500/70";
      case 4:
        return "bg-cyan-500 border-cyan-400/80 hover:bg-cyan-400";
      default:
        return "bg-white/[0.02]";
    }
  };

  return (
    <div className="border-border-subtle bg-bg-secondary/40 flex h-full flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
      <div>
        <h3 className="mb-1 text-xs font-bold tracking-wider text-white uppercase">
          {t("heatmap_title", { defaultValue: "Incident Distribution Heatmap" })}
        </h3>
        <p className="text-fg-muted mb-6 text-[11px]">
          {t("heatmap_subtitle", {
            defaultValue:
              "Visual heat distribution of verified incidents per category over the last week.",
          })}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2">
        {/* Days label header */}
        <div className="grid grid-cols-6 gap-2">
          {/* Spacer for category label column */}
          <div className="col-span-1" />
          <div className="col-span-5 grid grid-cols-7 gap-1 text-center">
            {days.map((day) => (
              <span
                key={day}
                className="text-fg-muted text-[10px] font-bold tracking-wider uppercase"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Heatmap rows */}
        <div className="grid grid-cols-6 gap-2">
          {categories.map((cat, rowIdx) => (
            <React.Fragment key={cat}>
              {/* Category label column */}
              <div className="col-span-1 flex min-w-0 items-center">
                <span className="text-fg-secondary truncate text-[10px] font-bold" title={cat}>
                  {cat}
                </span>
              </div>

              {/* Day cells */}
              <div className="col-span-5 grid grid-cols-7 gap-1">
                {data[rowIdx]?.map((val, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`h-7 cursor-pointer rounded border transition-colors duration-200 ${getColorClass(val)} group relative`}
                  >
                    {/* Tooltip on hover */}
                    <span className="bg-bg-secondary border-border-subtle pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded border px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-xl group-hover:block">
                      {val}{" "}
                      {val === 1 ? t("heatmap_incident_singular") : t("heatmap_incident_plural")}
                    </span>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
