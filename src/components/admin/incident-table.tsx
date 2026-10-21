"use client";

import React from "react";
import { Clock, Cpu, Building } from "lucide-react";
import { StatusBadge } from "@/components/admin-core/status-badge";
import type { IncidentRecord } from "@/types/admin";

interface IncidentTableProps {
  filtered: IncidentRecord[];
  selectedId?: string;
  onSelect: (inc: IncidentRecord) => void;
}

// incidents/page.tsx içinden saf çıkarma: sol kolon vaka akış kuyruğu (görsel aynı).
export const IncidentTable = React.memo(function IncidentTable({
  filtered,
  selectedId,
  onSelect,
}: IncidentTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] shadow-sm lg:col-span-7 xl:col-span-8 dark:border-[#30363d] dark:bg-[#161b22]">
      <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
        <span className="font-sans text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
          VAKA AKIŞ KUYRUĞU
        </span>
        <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
          Anlık Veri Görünümü
        </span>
      </div>

      <div className="max-h-[680px] divide-y divide-[#d0d7de] overflow-y-auto dark:divide-[#30363d]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center font-sans text-xs text-[#656d76] dark:text-[#8b949e]">
            Arama kriterlerine uygun vaka bulunamadı.
          </div>
        ) : (
          filtered.map((inc) => {
            const isSelected = selectedId === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => onSelect(inc)}
                className={`cursor-pointer p-3.5 transition-all ${
                  isSelected
                    ? "border-l-4 border-l-[#0969da] bg-[#f6f8fa] dark:border-l-[#58a6ff] dark:bg-[#21262d]"
                    : "hover:bg-[#f6f8fa]/60 dark:hover:bg-[#161b22]/80"
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans text-[11px] font-bold text-[#0969da] dark:text-[#58a6ff]">
                      {inc.trackingNumber}
                    </span>
                    <StatusBadge type="severity" value={inc.severity} />
                    <StatusBadge type="status" value={inc.status} />
                    <StatusBadge type="compliance" value={inc.euAiActTag} />
                  </div>
                  {inc.slaRemainingHours > 0 && inc.slaRemainingHours <= 24 && (
                    <span className="flex shrink-0 items-center gap-1 rounded border border-[#ff8182]/40 bg-[#ffebe9] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-[#cf222e] dark:bg-[#490202] dark:text-[#ff7b72]">
                      <Clock className="h-3 w-3" />
                      {inc.slaRemainingHours}h SLA
                    </span>
                  )}
                </div>

                <h3 className="mb-1 line-clamp-1 text-xs font-semibold text-balance text-[#1f2328] dark:text-[#f0f6fc]">
                  {inc.title}
                </h3>

                <p className="mb-2 line-clamp-2 font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
                  {inc.summary}
                </p>

                <div className="flex items-center justify-between pt-1 font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {inc.modelTarget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {inc.affectedIndustry}
                    </span>
                  </div>
                  <span>{new Date(inc.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
