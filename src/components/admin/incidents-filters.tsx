"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";

export interface IncidentFilterValues {
  search: string;
  statusFilter: string;
  severityFilter: string;
  euFilter: string;
  providerFilter: string;
  resultCount: number;
}

interface IncidentFiltersProps extends IncidentFilterValues {
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSeverityChange: (v: string) => void;
  onEuChange: (v: string) => void;
  onProviderChange: (v: string) => void;
  onClear: () => void;
}

// incidents/page.tsx içinden saf çıkarma: arama + 4 filtre + sayaç (görsel aynı).
export const IncidentFilters = React.memo(function IncidentFilters(props: IncidentFiltersProps) {
  const {
    search,
    statusFilter,
    severityFilter,
    euFilter,
    providerFilter,
    resultCount,
    onSearchChange,
    onStatusChange,
    onSeverityChange,
    onEuChange,
    onProviderChange,
    onClear,
  } = props;
  const hasActive =
    statusFilter !== "ALL" ||
    severityFilter !== "ALL" ||
    euFilter !== "ALL" ||
    providerFilter !== "ALL" ||
    search;

  return (
    <div className="space-y-3 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
          <input
            type="search"
            aria-label="Vaka ara"
            placeholder="Vaka no (ALP-...), model (GPT-4o), şirket, sektör veya anahtar kelime ara..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-[#d0d7de] bg-[#ffffff] py-1.5 pr-4 pl-9 font-sans text-xs text-[#1f2328] placeholder-[#656d76] focus:ring-1 focus:ring-[#0969da] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:placeholder-[#8b949e] dark:focus:ring-[#58a6ff]"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Aramayı temizle"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#656d76] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasActive && (
          <button
            onClick={onClear}
            className="rounded-md border border-transparent px-2.5 py-1.5 font-sans text-xs text-[#cf222e] transition-colors hover:bg-[#ffebe9] dark:text-[#ff7b72] dark:hover:bg-[#490202]"
          >
            Filtreleri Sıfırla
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#d0d7de]/60 pt-2 text-xs dark:border-[#30363d]/60">
        <div className="flex items-center gap-1.5 font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          <Filter className="h-3 w-3" />
          <span>Filtrele:</span>
        </div>

        <select
          aria-label="Durum filtresi"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
        >
          <option value="ALL">Durum: Tümü</option>
          <option value="UNDER_TRIAGE">Triage Aşamasında</option>
          <option value="VERIFIED">Doğrulandı (Verified)</option>
          <option value="RESOLVED">Çözüldü (Resolved)</option>
          <option value="DISPUTED">İtirazlı (Disputed)</option>
        </select>

        <select
          aria-label="Şiddet filtresi"
          value={severityFilter}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
        >
          <option value="ALL">Şiddet: Tümü</option>
          <option value="CRITICAL">Critical (Kritik)</option>
          <option value="HIGH">High (Yüksek)</option>
          <option value="MEDIUM">Medium (Orta)</option>
          <option value="LOW">Low (Düşük)</option>
        </select>

        <select
          aria-label="EU AI Act filtresi"
          value={euFilter}
          onChange={(e) => onEuChange(e.target.value)}
          className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
        >
          <option value="ALL">EU AI Act: Tümü</option>
          <option value="PROHIBITED_ART5">Madde 5 (Yasaklı)</option>
          <option value="HIGH_RISK_ART6">Madde 6 (Yüksek Risk)</option>
          <option value="GPAI_SYSTEMIC_ART51">Madde 51 (GPAI Sistemik)</option>
          <option value="TRANSPARENCY_ART50">Madde 50 (Şeffaflık)</option>
        </select>

        <select
          aria-label="Sağlayıcı filtresi"
          value={providerFilter}
          onChange={(e) => onProviderChange(e.target.value)}
          className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
        >
          <option value="ALL">Sağlayıcı: Tümü</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="Google">Google</option>
          <option value="Meta">Meta</option>
          <option value="DeepSeek">DeepSeek</option>
        </select>

        <span className="ml-auto font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          <strong>{resultCount}</strong> vaka listeleniyor
        </span>
      </div>
    </div>
  );
});
