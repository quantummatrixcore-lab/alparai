"use client";

import React from "react";
import { CreditCard, DollarSign, TrendingUp, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function FinancePage() {
  const transactions = [
    {
      id: "TX-901",
      client: "Allianz Global Risk Underwriting",
      plan: "Tier 3 Institutional Data Feed",
      amount: "$45,000.00",
      date: "2026-08-01",
      status: "PAID",
    },
    {
      id: "TX-902",
      client: "Swiss Re Risk Modelling Hub",
      plan: "Tier 3 Institutional Data Feed",
      amount: "$55,000.00",
      date: "2026-08-01",
      status: "PAID",
    },
    {
      id: "TX-903",
      client: "JPMorgan Chase SecOps CISO",
      plan: "Tier 2 Enterprise Threat Feed",
      amount: "$9,500.00",
      date: "2026-08-01",
      status: "PAID",
    },
    {
      id: "TX-904",
      client: "Nordic Bank SOC Team",
      plan: "Tier 1 Growth Feed",
      amount: "$1,499.00",
      date: "2026-08-10",
      status: "PAID",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 3: SERMAYE & FİNANS
            </span>
            <span className="font-sans text-xs font-semibold text-emerald-400">
              STRIPE CONNECT & REVENUE LEDGER
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Stripe Finans & Nakit Akış Masası
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            B2B API abonelikleri, yıllık taahhütlü kurumsal sözleşmeler ve brüt kârlılık oranları
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Aylık Tekrarlayan Gelir (MRR)"
          value="$110.999"
          subtext="Yıllıklandırılmış: $1.33M ARR"
          change="+%18.4"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="Brüt Kâr Marjı (Gross Margin)"
          value="%89.2"
          subtext="Düşük Altyapı Maliyeti & Yüksek Katma Değer"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          label="Net Gelir Tutma Oranı (NRR)"
          value="%128"
          subtext="Kurumsal Müşteri Kota Büyümeleri"
          changeType="positive"
          icon={CreditCard}
        />
      </div>

      {/* Transactions Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Son Kurumsal Faturalandırma ve Tahsilatlar
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">FATURA NO</th>
                <th className="pb-2">KURUMSAL MÜŞTERİ</th>
                <th className="pb-2">PAKET</th>
                <th className="pb-2">TUTAR</th>
                <th className="pb-2">TARİH</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{tx.id}</td>
                  <td className="py-3 font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {tx.client}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {tx.plan}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">{tx.amount}</td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {tx.date}
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {tx.status}
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
