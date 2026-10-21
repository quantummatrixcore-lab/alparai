"use client";

import React from "react";
import { Copy, Check, CheckCircle, Scale } from "lucide-react";
import { StatusBadge } from "@/components/admin-core/status-badge";
import type { IncidentRecord } from "@/types/admin";

interface IncidentInspectorProps {
  incident: IncidentRecord;
  copiedHash: boolean;
  onCopyHash: (hash: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onTriggerAudit: () => void;
}

// incidents/page.tsx içinden saf çıkarma: sağ kolon derin denetçi (görsel aynı).
export const IncidentInspector = React.memo(function IncidentInspector({
  incident,
  copiedHash,
  onCopyHash,
  onStatusChange,
  onTriggerAudit,
}: IncidentInspectorProps) {
  return (
    <div className="sticky top-20 space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
      <div className="border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-sans text-xs font-bold text-[#0969da] dark:text-[#58a6ff]">
            {incident.trackingNumber}
          </span>
          <div className="flex items-center gap-1.5">
            <StatusBadge type="severity" value={incident.severity} />
            <StatusBadge type="status" value={incident.status} />
          </div>
        </div>
        <h2 className="text-sm leading-snug font-bold text-balance text-[#1f2328] dark:text-[#f0f6fc]">
          {incident.title}
        </h2>
      </div>

      <div className="space-y-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
        <div className="flex items-center justify-between font-sans text-xs">
          <span className="text-[#656d76] dark:text-[#8b949e]">EU AI Act Sınıfı:</span>
          <StatusBadge type="compliance" value={incident.euAiActTag} />
        </div>
        <div className="flex items-center justify-between font-sans text-xs">
          <span className="text-[#656d76] dark:text-[#8b949e]">Potansiyel Ceza Riski:</span>
          <span className="font-bold text-[#cf222e] dark:text-[#ff7b72]">
            €{incident.potentialFineEur.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between font-sans text-xs">
          <span className="text-[#656d76] dark:text-[#8b949e]">Madde 73 SLA:</span>
          <span className="font-bold text-[#9a6700] dark:text-[#d29922]">
            {incident.slaRemainingHours > 0
              ? `${incident.slaRemainingHours} Saat Kaldı`
              : "SLA Doldu / Bildirildi"}
          </span>
        </div>
      </div>

      <div className="space-y-2 font-sans text-xs">
        <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
          <span className="text-[#656d76] dark:text-[#8b949e]">Hedef Model:</span>
          <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            {incident.modelTarget}
          </span>
        </div>
        <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
          <span className="text-[#656d76] dark:text-[#8b949e]">Sağlayıcı:</span>
          <span className="text-[#1f2328] dark:text-[#f0f6fc]">{incident.provider}</span>
        </div>
        <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
          <span className="text-[#656d76] dark:text-[#8b949e]">Kaynak Türü:</span>
          <span className="text-[#0969da] dark:text-[#58a6ff]">{incident.source}</span>
        </div>
        <div className="flex justify-between border-b border-[#d0d7de]/50 py-1 dark:border-[#30363d]/50">
          <span className="text-[#656d76] dark:text-[#8b949e]">İhbarcı Doğrulaması:</span>
          <span className="font-semibold text-[#1a7f37] dark:text-[#3fb950]">
            {incident.humanVerified ? "✓ Doğrulanmış İnsan" : "Otomatik Tarama"}
          </span>
        </div>
      </div>

      <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
        <div className="flex items-center justify-between font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
          <span>SHA-256 DELİL MÜHRÜ</span>
          <button
            onClick={() => onCopyHash(incident.evidenceHash)}
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
          {incident.evidenceHash}
        </p>
      </div>

      <div className="space-y-1">
        <span className="font-sans text-[11px] font-semibold text-[#656d76] dark:text-[#8b949e]">
          VAKA ÖZETİ & ANALİZ
        </span>
        <p className="rounded border border-[#d0d7de] bg-[#f6f8fa] p-2.5 text-xs leading-relaxed text-[#1f2328] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]">
          {incident.summary}
        </p>
      </div>

      <div className="space-y-2 border-t border-[#d0d7de] pt-2 dark:border-[#30363d]">
        <span className="mb-1 block font-sans text-[11px] text-[#656d76] dark:text-[#8b949e]">
          KOMUTA EYLEMLERİ:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onStatusChange(incident.id, "VERIFIED")}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-[#2ea043]"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Doğrula</span>
          </button>
          <button
            onClick={() => onStatusChange(incident.id, "RESOLVED")}
            className="flex items-center justify-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#ffffff] px-3 py-2 font-sans text-xs font-semibold text-[#1f2328] transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Çözüldü</span>
          </button>
        </div>
        <button
          onClick={onTriggerAudit}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#8957e5]/40 bg-[#8957e5]/10 px-3 py-2 font-sans text-xs font-semibold text-[#8250df] transition-colors hover:bg-[#8957e5]/20 dark:text-[#a371f7]"
        >
          <Scale className="h-3.5 w-3.5" />
          <span>10-Model Cross-Audit Tetikle</span>
        </button>
      </div>
    </div>
  );
});
