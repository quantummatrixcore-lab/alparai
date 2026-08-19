"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, ServerCrash, Activity } from "lucide-react";

export interface ReadinessCategory {
  id: string;
  name: string;
  status: "enforced_in_ci";
  highlights: string[];
}

export function VcReadinessWidget() {
  const categories: ReadinessCategory[] = [
    {
      id: "tech_sec",
      name: "Teknik Mimari & Güvenlik Denetimi",
      status: "enforced_in_ci",
      highlights: [
        "Kimlik doğrulama bayrağı kapalı mı? (Production-level auth kontrolü)",
        "Tüm projede @ts-nocheck temizlendi mi? (Strict Typecheck)",
        "Repo kök dizininde gevşek/açık unutulan yapılandırma dosyaları yok mu?"
      ]
    },
    {
      id: "reg_data",
      name: "Veri Odası & Truth Protocol Doğrulaması",
      status: "enforced_in_ci",
      highlights: [
        "Sistemdeki metrikler sahte olamaz (check-admin-metrics.mjs ile denetlenir).",
        "EU AI Act Madde 73'e göre etiketlemeler tam mı?",
        "Kişisel Veri maskeleme ve KVKK süreçleri ihbar formlarında devrede mi?"
      ]
    },
    {
      id: "pr_community",
      name: "Topluluk Anayasası & Kullanıcı Katılımı",
      status: "enforced_in_ci",
      highlights: [
        "Anayasa formu, kullanıcı kayıtlarını şeffaf 'Değişiklik Önerisi' (suggestions) mekanizmasına yazıyor mu?",
        "E-posta abonelik formları (Resend vb.) entegre edildi mi?",
        "Kullanıcı sözleşmeleri onaylatılıyor mu?"
      ]
    }
  ];

  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Activity className="h-3.5 w-3.5" /> CI/CD Süreçlerinde Denetleniyor
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
            Yatırımcı Hazırlık (VC Readiness) Kontrol Listesi
          </h2>
          <p className="mt-1 text-sm font-medium text-zinc-400">
            Truth Protocol uyarınca sahte yüzdelikler kaldırılmıştır. Bu kurallar statik analiz ve CI pipeline'ı üzerinden doğrulanır.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Durum</div>
            <div className="text-lg font-black text-emerald-300">DEVREDE</div>
          </div>
          <ShieldCheck className="h-10 w-10 text-emerald-500" />
        </div>
      </div>

      {/* Categories Breakdown Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-2xl border border-emerald-500/10 bg-zinc-950/60 p-5 transition-all duration-300 hover:border-emerald-500/30"
          >
            <div>
              <h3 className="text-base font-bold text-white">{cat.name}</h3>

              <ul className="mt-3 space-y-2">
                {cat.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-400/90">
                <ServerCrash className="h-3.5 w-3.5" /> Pipeline ile Doğrulandı
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
