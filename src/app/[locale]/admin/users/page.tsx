"use client";

import React, { useState } from "react";
import { Users, Shield, UserCheck, Lock, Search, Plus, Filter } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const users = [
    {
      id: "USR-01",
      name: "Dr. Michael Chen",
      email: "m.chen@oxford-ethics.ac.uk",
      role: "AKADEMİK HAKEM",
      status: "VERIFIED",
      registered: "2026-06-10",
      actionsCount: 42,
    },
    {
      id: "USR-02",
      name: "Sophia Kowalski",
      email: "s.kowalski@allianz-ai-risk.de",
      role: "KURUMSAL CISO",
      status: "VERIFIED",
      registered: "2026-07-01",
      actionsCount: 180,
    },
    {
      id: "USR-03",
      name: "Zero-Knowledge Hunter #42",
      email: "encrypted_vault_42@sec.alparai.com",
      role: "DOĞRULANMIŞ İHBARCI",
      status: "ANONYMOUS_SEALED",
      registered: "2026-08-15",
      actionsCount: 8,
    },
    {
      id: "USR-04",
      name: "Admin Operations Desk",
      email: "root@alparai.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE_2FA",
      registered: "2026-05-01",
      actionsCount: 1420,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 5: AKADEMİ & YÖNETİŞİM
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-400">
              USER & WHISTLEBLOWER RBAC
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kullanıcı, İhbarcı & Kurumsal Müşteri Masası (/users)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Platform kullanıcıları, anonim doğrulanmış ihbarcılar, akademik hakemler ve kurumsal
            CISO hesapları
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Kurumsal Kullanıcı Davet Et</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Toplam Kayıtlı Kullanıcı"
          value="4.820"
          subtext="Araştırmacı, CISO, Hakem & İhbarcı"
          change="+%14.2"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          label="Anonim İhbarcı Kasası"
          value="498 Kişi"
          subtext="Sıfır-Bilgi Kriptografik Kimlikler"
          icon={Lock}
        />
        <MetricCard
          label="Kurumsal Hesaplar"
          value="18 Şirket"
          subtext="Allianz, Swiss Re, JPMorgan, Nordic"
          icon={UserCheck}
        />
        <MetricCard
          label="2FA Güvenlik Uyumu"
          value="%100"
          subtext="Tüm Yetkili Roller İçin Zorunlu"
          changeType="positive"
          icon={Shield}
        />
      </div>

      {/* Users Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            Kullanıcı Hesapları ve Rol Hiyerarşisi
          </h2>
          <div className="relative w-64">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim veya e-posta ara..."
              className="w-full rounded border border-[#d0d7de] bg-zinc-950 py-1 pr-2 pl-8 text-xs text-zinc-200 dark:border-[#30363d]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">KOD</th>
                <th className="pb-2">KULLANICI ADI</th>
                <th className="pb-2">E-POSTA / KİMLİK</th>
                <th className="pb-2">ROL</th>
                <th className="pb-2">İŞLEM SAYISI</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{u.id}</td>
                  <td className="py-3 font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {u.name}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {u.email}
                  </td>
                  <td className="py-3">
                    <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-[#656d76] dark:text-[#c9d1d9]">
                    {u.actionsCount} İşlem
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
