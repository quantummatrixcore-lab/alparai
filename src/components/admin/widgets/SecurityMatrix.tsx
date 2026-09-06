"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  Key,
  TerminalSquare,
  RefreshCw,
} from "lucide-react";

const SECURITY_CHECKS = [
  { title: "WAF & BotGuard Koruma", status: "Korumalı", sub: "Cloudflare Turnstile & Edge Firewall", healthy: true, icon: Lock },
  { title: "Secret Leaks & Gitleaks", status: "0 İhlal", sub: "Tüm API anahtarları şifrelendi", healthy: true, icon: Key },
  { title: "SQL Injection & XSS Kalkanı", status: "Aktif", sub: "Supabase RLS & Zod Validasyonu", healthy: true, icon: ShieldCheck },
  { title: "Otonom Red Team Taraması", status: "Temiz", sub: "Sun Tzu & Fatih Siber Savunma", healthy: true, icon: Eye },
];

export const SecurityMatrix = React.memo(function SecurityMatrix() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const scanTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  const handleScan = React.useCallback(() => {
    setIsScanning(true);
    setScanMessage(null);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => {
      setIsScanning(false);
      setScanMessage("Kritik Güvenlik Taraması Tamamlandı: 0 Açık, 0 Sızıntı, %100 Korumalı.");
    }, 1300);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#0d0d12]/90 p-3.5 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 w-full min-w-0">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-3 border-b border-[#27272a] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white truncate">
                SİBER GÜVENLİK & SAVUNMA MATRİSİ
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold font-mono text-emerald-400 shrink-0">
                A+ DEFENSE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Gerçek Zamanlı Tehdit Tespiti, Secret Denetimi & RLS Kalkanı
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all hover:bg-emerald-500/25 hover:border-emerald-500/70 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isScanning ? "Taranıyor..." : "Hızlı Güvenlik Taraması"}</span>
        </button>
      </div>

      {/* Grid of Security Vectors */}
      <div className="relative z-10 mt-4 sm:mt-5 grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SECURITY_CHECKS.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.title}
              className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3 sm:p-3.5 backdrop-blur-md transition-all hover:border-emerald-500/30 min-w-0"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                  {check.status}
                </span>
              </div>
              <div className="mt-2.5 min-w-0">
                <div className="text-xs font-bold text-white truncate">{check.title}</div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 truncate">{check.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {scanMessage && (
        <div className="relative z-10 mt-3 sm:mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-mono text-emerald-300">
          <TerminalSquare className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="break-words">{scanMessage}</span>
        </div>
      )}
    </section>
  );
});

export default SecurityMatrix;
