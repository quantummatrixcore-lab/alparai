"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  Copy,
  Check,
  Clock,
  Building,
  Cpu,
  Scale,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/admin-core/status-badge";
import { IncidentsTelemetry } from "@/components/admin/incidents-telemetry";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";
import { getAdminIncidentsList } from "@/actions/admin/overview";
import { useTranslations } from "next-intl";
import {
  type IncidentRecord,
  type IncidentStatus,
} from "@/types/admin";

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

      {/* Filter Control Bar (GitHub Issues Style) */}
      <div className="space-y-3 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
            <input
              type="search"
              aria-label="Vaka ara"
              placeholder="Vaka no (ALP-...), model (GPT-4o), şirket, sektör veya anahtar kelime ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#d0d7de] bg-[#ffffff] py-1.5 pr-4 pl-9 font-sans text-xs text-[#1f2328] placeholder-[#656d76] focus:ring-1 focus:ring-[#0969da] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:placeholder-[#8b949e] dark:focus:ring-[#58a6ff]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#656d76] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#f0f6fc]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear */}
          {(statusFilter !== "ALL" ||
            severityFilter !== "ALL" ||
            euFilter !== "ALL" ||
            providerFilter !== "ALL" ||
            search) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setSeverityFilter("ALL");
                setEuFilter("ALL");
                setProviderFilter("ALL");
                setSearch("");
              }}
              className="rounded-md border border-transparent px-2.5 py-1.5 font-sans text-xs text-[#cf222e] transition-colors hover:bg-[#ffebe9] dark:text-[#ff7b72] dark:hover:bg-[#490202]"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#d0d7de]/60 pt-2 text-xs dark:border-[#30363d]/60">
          <div className="flex items-center gap-1.5 font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
            <Filter className="h-3 w-3" />
            <span>Filtrele:</span>
          </div>

          {/* Durum */}
          <select
            aria-label="Durum filtresi"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
          >
            <option value="ALL">Durum: Tümü</option>
            <option value="UNDER_TRIAGE">Triage Aşamasında</option>
            <option value="VERIFIED">Doğrulandı (Verified)</option>
            <option value="RESOLVED">Çözüldü (Resolved)</option>
            <option value="DISPUTED">İtirazlı (Disputed)</option>
          </select>

          {/* Şiddet */}
          <select
            aria-label="Şiddet filtresi"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
          >
            <option value="ALL">Şiddet: Tümü</option>
            <option value="CRITICAL">Critical (Kritik)</option>
            <option value="HIGH">High (Yüksek)</option>
            <option value="MEDIUM">Medium (Orta)</option>
            <option value="LOW">Low (Düşük)</option>
          </select>

          {/* EU AI Act */}
          <select
            aria-label="EU AI Act filtresi"
            value={euFilter}
            onChange={(e) => setEuFilter(e.target.value)}
            className="rounded border border-[#d0d7de] bg-[#ffffff] px-2 py-1 font-sans text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
          >
            <option value="ALL">EU AI Act: Tümü</option>
            <option value="PROHIBITED_ART5">Madde 5 (Yasaklı)</option>
            <option value="HIGH_RISK_ART6">Madde 6 (Yüksek Risk)</option>
            <option value="GPAI_SYSTEMIC_ART51">Madde 51 (GPAI Sistemik)</option>
            <option value="TRANSPARENCY_ART50">Madde 50 (Şeffaflık)</option>
          </select>

          {/* Sağlayıcı */}
          <select
            aria-label="Sağlayıcı filtresi"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
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
            <strong>{filtered.length}</strong> vaka listeleniyor
          </span>
        </div>
      </div>

      {/* Main Content Layout: Master-Detail Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Incidents Table (8 Cols) */}
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
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
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

        {/* Right Column: Selected Incident Deep Inspector (5 Cols) */}
        <div className="space-y-4 lg:col-span-5 xl:col-span-4">
          {selectedIncident ? (
            <div className="sticky top-20 space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
              {/* Header */}
              <div className="border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-sans text-xs font-bold text-[#0969da] dark:text-[#58a6ff]">
                    {selectedIncident.trackingNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge type="severity" value={selectedIncident.severity} />
                    <StatusBadge type="status" value={selectedIncident.status} />
                  </div>
                </div>
                <h2 className="text-sm leading-snug font-bold text-balance text-[#1f2328] dark:text-[#f0f6fc]">
                  {selectedIncident.title}
                </h2>
              </div>

              {/* Legal & Fine Exposure Card */}
              <div className="space-y-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
                <div className="flex items-center justify-between font-sans text-xs">
                  <span className="text-[#656d76] dark:text-[#8b949e]">EU AI Act Sınıfı:</span>
                  <StatusBadge type="compliance" value={selectedIncident.euAiActTag} />
                </div>
                <div className="flex items-center justify-between font-sans text-xs">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Potansiyel Ceza Riski:</span>
                  <span className="font-bold text-[#cf222e] dark:text-[#ff7b72]">
                    €{selectedIncident.potentialFineEur.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between font-sans text-xs">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Madde 73 SLA:</span>
                  <span className="font-bold text-[#9a6700] dark:text-[#d29922]">
                    {selectedIncident.slaRemainingHours > 0
                      ? `${selectedIncident.slaRemainingHours} Saat Kaldı`
                      : "SLA Doldu / Bildirildi"}
                  </span>
                </div>
              </div>

              {/* Technical Profile */}
              <div className="space-y-2 font-sans text-xs">
                <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Hedef Model:</span>
                  <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {selectedIncident.modelTarget}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Sağlayıcı:</span>
                  <span className="text-[#1f2328] dark:text-[#f0f6fc]">
                    {selectedIncident.provider}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
                  <span className="text-[#656d76] dark:text-[#8b949e]">Kaynak Türü:</span>
                  <span className="text-[#0969da] dark:text-[#58a6ff]">
                    {selectedIncident.source}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
                  <span className="text-[#656d76] dark:text-[#8b949e]">İhbarcı Doğrulaması:</span>
                  <span className="font-semibold text-[#1a7f37] dark:text-[#3fb950]">
                    {selectedIncident.humanVerified ? "✓ Doğrulanmış İnsan" : "Otomatik Tarama"}
                  </span>
                </div>
              </div>

              {/* Cryptographic Proof Hash */}
              <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
                <div className="flex items-center justify-between font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
                  <span>SHA-256 DELİL MÜHRÜ</span>
                  <button
                    onClick={() => handleCopyHash(selectedIncident.evidenceHash)}
                    className="flex items-center gap-1 text-[#0969da] hover:underline dark:text-[#58a6ff]"
                  >
                    {copiedHash ? (
                      <Check className="h-3 w-3 text-[#1a7f37] dark:text-[#3fb950]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedHash ? "Kopyalandı" : "Kopyala"}</span>
                  </button>
                </div>
                <p className="font-sans text-[10px] break-all text-[#656d76] dark:text-[#8b949e]">
                  {selectedIncident.evidenceHash}
                </p>
              </div>

              {/* Summary Description */}
              <div className="space-y-1">
                <span className="font-sans text-[11px] font-semibold text-[#656d76] dark:text-[#8b949e]">
                  VAKA ÖZETİ & ANALİZ
                </span>
                <p className="rounded border border-[#d0d7de] bg-[#f6f8fa] p-2.5 text-xs leading-relaxed text-[#1f2328] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]">
                  {selectedIncident.summary}
                </p>
              </div>

              {/* Triage Actions */}
              <div className="space-y-2 border-t border-[#d0d7de] pt-2 dark:border-[#30363d]">
                <span className="mb-1 block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
                  KOMUTA EYLEMLERİ:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedIncident.id, "VERIFIED")}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-[#2ea043]"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Doğrula</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedIncident.id, "RESOLVED")}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#ffffff] px-3 py-2 font-sans text-xs font-semibold text-[#1f2328] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Çözüldü</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setActionNotice(
                      `${selectedIncident.trackingNumber} için 10-Model Cross-Audit tetiklendi.`,
                    );
                    setTimeout(() => setActionNotice(null), 3000);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#8957e5]/40 bg-[#8957e5]/10 px-3 py-2 font-sans text-xs font-semibold text-[#8250df] transition-colors hover:bg-[#8957e5]/20 dark:text-[#a371f7]"
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>10-Model Cross-Audit Tetikle</span>
                </button>
              </div>
            </div>
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
          <div className="animate-in fade-in zoom-in w-full max-w-md space-y-4 rounded-lg border border-border-subtle bg-bg-elevated p-5 shadow-2xl duration-150">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-sans text-sm font-bold text-balance text-fg-primary">
                Veri Setini Dışa Aktar (B2B Hazırlık)
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-fg-muted hover:text-fg-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-fg-muted">
              Şu an filtrelenmiş olan <strong>{filtered.length} vaka</strong>, SHA-256 zaman
              damgaları ve EU AI Act regülasyon etiketleriyle birlikte dışa aktarılacaktır.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 rounded-md border border-brand-500/40 bg-brand-500/10 p-3 font-sans text-xs font-bold text-brand-400 transition-all hover:bg-brand-500/20"
              >
                <Download className="h-4 w-4" />
                <span>JSON İndir</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 rounded-md border border-success-500/40 bg-success-500/10 p-3 font-sans text-xs font-bold text-success-400 transition-all hover:bg-success-500/20"
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

