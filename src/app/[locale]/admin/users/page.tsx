"use client";

import React, { useState } from "react";
import { Users, Shield, UserCheck, Lock, Search, Plus, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations("admin.sidebar");
  const [search, setSearch] = useState("");
  const { users, totalCount, loading, error } = useAdminUsers({ search });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 5: AKADEMİ & YÖNETİŞİM
            </span>
            <span className="font-sans text-xs font-semibold text-emerald-400">
              USER & WHISTLEBLOWER RBAC
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kullanıcı, İhbarcı & Kurumsal Müşteri Masası (/users)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Platform kullanıcıları, anonim doğrulanmış ihbarcılar, akademik hakemler ve kurumsal
            CISO hesapları
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-sans text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Kurumsal Kullanıcı Davet Et</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Toplam Kayıtlı Kullanıcı"
          value={totalCount.toString()}
          subtext="Canlı Supabase Veritabanı"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          label="Anonim İhbarcı Kasası"
          value="Korumalı"
          subtext="Sıfır-Bilgi Kriptografik Kimlikler"
          icon={Lock}
        />
        <MetricCard
          label="Yetkili Roller"
          value={users.filter(u => u.role === "admin" || u.role === "moderator" || u.role === "expert").length.toString()}
          subtext="Yönetici, Moderatör & Uzman"
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
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-sans text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
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
              className="w-full rounded border border-[#d0d7de] bg-[#f6f8fa] py-1 pr-2 pl-8 text-xs text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-[#656d76] dark:text-[#8b949e]">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            <span>Supabase veritabanına bağlanılıyor...</span>
          </div>
        ) : error ? (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
            Kullanıcılar yüklenirken hata oluştu: {error.message}
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center text-[#656d76] dark:text-[#8b949e]">
            <p>Eşleşen kullanıcı kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#d0d7de] text-[#656d76] dark:border-[#30363d] dark:text-[#8b949e]">
                  <th className="pb-2">KOD</th>
                  <th className="pb-2">KULLANICI ADI</th>
                  <th className="pb-2">E-POSTA</th>
                  <th className="pb-2">ROL</th>
                  <th className="pb-2">KAYIT TARİHİ</th>
                  <th className="pb-2 text-right">DURUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <td className="py-3 font-bold text-[#1f2328] dark:text-[#f0f6fc]">{u.id.slice(0, 8)}...</td>
                    <td className="py-3 font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                      {u.full_name || "İsimsiz Kullanıcı"}
                    </td>
                    <td className="py-3 text-[#656d76] dark:text-[#8b949e]">
                      {u.email}
                    </td>
                    <td className="py-3">
                      <span className="rounded border border-cyan-800/40 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-[#656d76] dark:text-[#8b949e]">
                      {new Date(u.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        u.is_banned
                          ? "border-red-800 bg-red-950/40 text-red-400"
                          : "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                      }`}>
                        {u.is_banned ? "YASAKLI" : "AKTİF"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
