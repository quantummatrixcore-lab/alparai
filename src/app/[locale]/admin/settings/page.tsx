"use client";

import React from "react";
import { Sliders, Shield, Users, Database, KeyRound, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 5: AKADEMİ & YÖNETİŞİM
            </span>
            <span className="font-sans text-xs font-semibold text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              RBAC & SYSTEM CONFIGURATION
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Sistem Parametreleri & Rol Masası (RBAC)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Admin yetkilendirmeleri, API hız limitleri, karanlık mod ve denetim logu ayarları
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Ayarları Kaydet</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-6 font-sans text-xs lg:grid-cols-2">
        {/* Section 1: Security & RBAC */}
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
          <div className="flex items-center gap-2 border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              Güvenlik ve Yetkilendirme (RBAC)
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d0d7de] py-2 dark:border-[#30363d]/40">
              <div>
                <div className="font-semibold text-zinc-200">
                  İki Aşamalı Doğrulama (2FA / TOTP)
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  Tüm Admin hesapları için zorunlu
                </div>
              </div>
              <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                AKTİF
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[#d0d7de] py-2 dark:border-[#30363d]/40">
              <div>
                <div className="font-semibold text-zinc-200">Sıfır-Bilgi SHA-256 İmzası</div>
                <div className="text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  Her olay için delil kütüğü mühürle
                </div>
              </div>
              <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                MÜHÜRLÜ
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold text-zinc-200">Olay Masası Otomatik Karantina</div>
                <div className="text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  Madde 5 ihlallerini anında blokla
                </div>
              </div>
              <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                AÇIK
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Rate Limits & Performance */}
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
          <div className="flex items-center gap-2 border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              B2B API Hız Sınırları & Telemetri
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                Tier 1 API İstek Limiti (RPS):
              </label>
              <input
                type="text"
                defaultValue="50 req/sec"
                className="w-full rounded border border-[#d0d7de] bg-zinc-950 p-2 font-sans text-xs text-zinc-200 dark:border-[#30363d]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                Tier 2 & 3 Dedicated Havuz SLA Hedefi:
              </label>
              <input
                type="text"
                defaultValue="15ms (Global Edge Cloudflare)"
                className="w-full rounded border border-[#d0d7de] bg-zinc-950 p-2 font-sans text-xs text-zinc-200 dark:border-[#30363d]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
