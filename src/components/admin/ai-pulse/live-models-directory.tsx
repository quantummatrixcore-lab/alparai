"use client";

import { useState } from "react";
import { Search, Cpu, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FreeModelRecord } from "@/lib/ai/discovery/fetch-models";
import { useTranslations } from "next-intl";

interface LiveModelsDirectoryProps {
  initialModels: FreeModelRecord[];
}

export function LiveModelsDirectory({ initialModels }: LiveModelsDirectoryProps) {
  const t = useTranslations("admin");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");
  const [sortField, setSortField] = useState<keyof FreeModelRecord>("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Derive active items based on filters
  const filtered = initialModels.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isFree = model.pricing_prompt === 0 && model.pricing_completion === 0;
    if (filterType === "free" && !isFree) return false;
    if (filterType === "paid" && isFree) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof FreeModelRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <Card className="bg-bg-secondary/40 col-span-1 mt-6 overflow-hidden border-white/5 backdrop-blur-xl lg:col-span-3">
      <CardHeader className="flex flex-col justify-between gap-4 border-b border-white/5 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-fg-muted flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            <Cpu className="h-4 w-4" /> {t("live_ai_models_directory")}
          </CardTitle>
          <p className="text-fg-muted mt-1 text-xs">
            {t("real_time_synchronization_with_openroute")}
            {initialModels.length} {t("models")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("search_models")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="placeholder:text-fg-muted/50 focus:ring-brand-500 w-full rounded-md border border-white/10 bg-white/5 py-1.5 pr-4 pl-9 text-sm text-white transition-all focus:ring-2 focus:outline-none sm:w-64"
            />
          </div>
          <div className="flex rounded-md bg-white/5 p-1">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-sm px-3 py-1 text-xs transition-colors ${
                filterType === "all"
                  ? "bg-white/10 font-medium text-white"
                  : "text-fg-muted hover:text-white"
              }`}
            >
              {t("all")}
            </button>
            <button
              onClick={() => setFilterType("free")}
              className={`rounded-sm px-3 py-1 text-xs transition-colors ${
                filterType === "free"
                  ? "bg-emerald-500/20 font-medium text-emerald-400"
                  : "text-fg-muted hover:text-emerald-400"
              }`}
            >
              {t("free")}
            </button>
            <button
              onClick={() => setFilterType("paid")}
              className={`rounded-sm px-3 py-1 text-xs transition-colors ${
                filterType === "paid"
                  ? "bg-brand-500/20 text-brand-400 font-medium"
                  : "text-fg-muted hover:text-brand-400"
              }`}
            >
              {t("paid")}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="custom-scrollbar max-h-[600px] overflow-y-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="text-fg-muted sticky top-0 z-10 border-b border-white/10 bg-white/5 text-xs uppercase backdrop-blur-md">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-6 py-4 font-bold tracking-wider hover:text-white"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {t("model")}{" "}
                  {sortField === "name" &&
                    (sortAsc ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-4 font-bold tracking-wider hover:text-white"
                onClick={() => toggleSort("provider")}
              >
                <div className="flex items-center gap-2">
                  {t("provider")}{" "}
                  {sortField === "provider" &&
                    (sortAsc ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-4 text-right font-bold tracking-wider hover:text-white"
                onClick={() => toggleSort("context_length")}
              >
                <div className="flex items-center justify-end gap-2">
                  {t("context")}{" "}
                  {sortField === "context_length" &&
                    (sortAsc ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-6 py-4 text-right font-bold tracking-wider hover:text-white"
                onClick={() => toggleSort("pricing_prompt")}
              >
                <div className="flex items-center justify-end gap-2">
                  {t("pricing_1m_t")}{" "}
                  {sortField === "pricing_prompt" &&
                    (sortAsc ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((model) => {
              const isFree = model.pricing_prompt === 0 && model.pricing_completion === 0;
              return (
                <tr key={model.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <Cpu className="text-fg-muted h-4 w-4" />
                      </div>
                      <div>
                        <div className="line-clamp-1 font-medium text-white">{model.name}</div>
                        <div className="text-fg-muted font-mono text-[10px]">{model.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-fg-secondary inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium">
                      {model.provider}
                    </span>
                  </td>
                  <td className="text-fg-secondary px-6 py-4 text-right font-mono text-xs">
                    {new Intl.NumberFormat().format(model.context_length)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isFree ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                        <CheckCircle2 className="h-3 w-3" /> {t("free")}
                      </span>
                    ) : (
                      <div className="text-xs">
                        <div className="text-brand-300 font-mono">
                          ${(model.pricing_prompt * 1000000).toFixed(2)}{" "}
                          <span className="text-fg-muted text-[10px]">IN</span>
                        </div>
                        <div className="text-brand-300 font-mono">
                          ${(model.pricing_completion * 1000000).toFixed(2)}{" "}
                          <span className="text-fg-muted text-[10px]">{t("out")}</span>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="text-fg-muted px-6 py-12 text-center">
                  {t("no_models_found_matching_your_criteria")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
