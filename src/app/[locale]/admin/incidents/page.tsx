"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Check, Building, X } from "lucide-react";
import { IncidentsTelemetry } from "@/components/admin/incidents-telemetry";
import { IncidentFilters } from "@/components/admin/incidents-filters";
import { IncidentTable } from "@/components/admin/incident-table";
import { IncidentInspector } from "@/components/admin/incident-inspector";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";
import { getAdminIncidentsList } from "@/actions/admin/overview";
import { useTranslations } from "next-intl";
import { type IncidentRecord, type IncidentStatus } from "@/types/admin";

export default function IncidentsPage() {
  const _t = useTranslations("admin.sidebar");
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [_loadingDb, setLoadingDb] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [euFilter, setEuFilter] = useState<string>("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRealIncidents() {
      try {
        setLoadingDb(true);
        const data = await getAdminIncidentsList(50);
        if (!cancelled) {
          setIncidents(data);
          if (data.length > 0) {
            setSelectedIncident(data[0] || null);
          }
        }
      } catch (err) {
        console.error("Failed to load real incidents:", err);
      } finally {
        if (!cancelled) {
          setLoadingDb(false);
        }
      }
    }
    fetchRealIncidents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Multi-facet filtering
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        inc.trackingNumber.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.modelTarget.toLowerCase().includes(q) ||
        inc.provider.toLowerCase().includes(q) ||
        inc.affectedIndustry.toLowerCase().includes(q) ||
        inc.summary.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || inc.status === statusFilter;
      const matchesSeverity = severityFilter === "ALL" || inc.severity === severityFilter;
      const matchesEu = euFilter === "ALL" || inc.euAiActTag === euFilter;
      const matchesProvider =
        providerFilter === "ALL" ||
        inc.provider.toLowerCase().includes(providerFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesSeverity && matchesEu && matchesProvider;
    });
  }, [incidents, search, statusFilter, severityFilter, euFilter, providerFilter]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleStatusChange = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc)),
    );
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setActionNotice(`Vaka durumu güncellendi: ${newStatus}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alparai_incidents_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportModal(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "TrackingNumber",
      "Title",
      "Provider",
      "ModelTarget",
      "Severity",
      "Status",
      "EUAIAct",
      "PotentialFineEur",
      "SLA_Hours",
    ];
    const rows = filtered.map((i) => [
      i.trackingNumber,
      `"${i.title.replace(/"/g, '""')}"`,
      i.provider,
      `"${i.modelTarget}"`,
      i.severity,
      i.status,
      i.euAiActTag,
      i.potentialFineEur,
      i.slaRemainingHours,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `alparai_incidents_export_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-bounce items-center gap-2 rounded-lg border border-[#3fb950] bg-[#238636] px-4 py-2.5 font-sans text-xs text-white shadow-xl">
          <Check className="h-4 w-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded border border-[#d0d7de] bg-[#eaeef2] px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              KÜME 1: HESAP VEREBİLİRLİK & VERİ FABRİKASI
            </span>
            <span className="font-sans text-xs font-semibold text-[#0969da] dark:text-[#58a6ff]">
              {incidents.length > 1
                ? `${incidents.length} VAKA (LİSTEDE)`
                : `${CANONICAL_INCIDENT_COUNT.toLocaleString("tr-TR")} VAKA İNDEKSİ`}
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-balance text-[#1f2328] dark:text-[#f0f6fc]">
            Olay İnceleme & Canlı Triage Masası
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Dağınık kamu akışları (CVE, Reddit, arXiv) ve doğrulanmış içeriden ihbarcıların 360°
            Zeka Katmanı
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/provider-review`}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-sm transition-all hover:bg-amber-500/20"
          >
            <Building className="h-3.5 w-3.5" />
            <span>Sağlayıcı Triage Masası</span>
          </Link>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-xs font-medium text-[#1f2328] shadow-sm transition-all hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
          >
            <Download className="h-3.5 w-3.5 text-[#656d76] dark:text-[#8b949e]" />
            <span>Veriyi Dışa Aktar ({filtered.length})</span>
          </button>
        </div>
      </div>

      <IncidentsTelemetry incidents={incidents} filtered={filtered} />

      <IncidentFilters
        search={search}
        statusFilter={statusFilter}
        severityFilter={severityFilter}
        euFilter={euFilter}
        providerFilter={providerFilter}
        resultCount={filtered.length}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onSeverityChange={setSeverityFilter}
        onEuChange={setEuFilter}
        onProviderChange={setProviderFilter}
        onClear={() => {
          setStatusFilter("ALL");
          setSeverityFilter("ALL");
          setEuFilter("ALL");
          setProviderFilter("ALL");
          setSearch("");
        }}
      />

      {/* Main Content Layout: Master-Detail Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <IncidentTable
          filtered={filtered}
          selectedId={selectedIncident?.id}
          onSelect={setSelectedIncident}
        />

        <div className="space-y-4 lg:col-span-5 xl:col-span-4">
          {selectedIncident ? (
            <IncidentInspector
              incident={selectedIncident}
              copiedHash={copiedHash}
              onCopyHash={handleCopyHash}
              onStatusChange={(id, s) => handleStatusChange(id, s as IncidentStatus)}
              onTriggerAudit={() => {
                setActionNotice(
                  `${selectedIncident.trackingNumber} için 10-Model Cross-Audit tetiklendi.`,
                );
                setTimeout(() => setActionNotice(null), 3000);
              }}
            />
          ) : (
            <div className="rounded-md border border-border-subtle bg-bg-elevated p-8 text-center font-sans text-xs text-fg-muted">
              Detayları görmek için sol listeden bir vaka seçin.
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in border-border-subtle bg-bg-elevated w-full max-w-md space-y-4 rounded-lg border p-5 shadow-2xl duration-150">
            <div className="border-border-subtle flex items-center justify-between border-b pb-3">
              <h3 className="text-fg-primary font-sans text-sm font-bold text-balance">
                Veri Setini Dışa Aktar (B2B Hazırlık)
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-fg-muted hover:text-fg-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-fg-muted text-xs">
              Şu an filtrelenmiş olan <strong>{filtered.length} vaka</strong>, SHA-256 zaman
              damgaları ve EU AI Act regülasyon etiketleriyle birlikte dışa aktarılacaktır.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="border-brand-500/40 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 flex items-center justify-center gap-2 rounded-md border p-3 font-sans text-xs font-bold transition-all"
              >
                <Download className="h-4 w-4" />
                <span>JSON İndir</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="border-success-500/40 bg-success-500/10 text-success-400 hover:bg-success-500/20 flex items-center justify-center gap-2 rounded-md border p-3 font-sans text-xs font-bold transition-all"
              >
                <Download className="h-4 w-4" />
                <span>CSV / Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
