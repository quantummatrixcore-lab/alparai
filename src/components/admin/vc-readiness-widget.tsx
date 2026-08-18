"use client";

import React from "react";
import { ListTodo, ShieldAlert, FileClock, Activity } from "lucide-react";

export interface ReadinessCategory {
  id: string;
  name: string;
  status: "pending_verification" | "verified";
  highlights: string[];
}

export function VcReadinessWidget() {
  const categories: ReadinessCategory[] = [
    {
      id: "tech_sec",
      name: "Teknik Mimari & Güvenlik Denetimi",
      status: "pending_verification",
      highlights: [
        "Kimlik doğrulama bayrağı kapalı mı? (Production-level auth kontrolü)",
        "Tüm projede @ts-nocheck temizlendi mi?",
        "Repo kök dizininde gevşek/açık unutulan yapılandırma dosyaları yok mu?"
      ]
    },
    {
      id: "reg_data",
      name: "Veri Odası (Data Room) Doğrulaması",
      status: "pending_verification",
      highlights: [
        "Veritabanındaki AI ihlali (incident) sayısı doğrulandı mı?",
        "EU AI Act Madde 73'e göre etiketlemeler tam mı?",
        "PII (Kişisel Veri) maskeleme sistemi ihbar formlarında devrede mi?"
      ]
    },
    {
      id: "pr_community",
      name: "Topluluk Anayasası & Kullanıcı Katılımı",
      status: "pending_verification",
      highlights: [
        "Anayasa formu kullanıcı kayıtlarını başarılı bir şekilde veritabanına yazıyor mu?",
        "E-posta abonelik formları (Resend vb.) entegre edildi mi?",
        "Kullanıcı sözleşmeleri (KVKK/GDPR) KVKK.md üzerinden onaylatılıyor mu?"
      ]
    }
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
            <Activity className="h-3.5 w-3.5" /> Doğrulama Bekliyor
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
            VC Hazırlık & Uyumluluk Kontrol Listesi
          </h2>
          <p className="mt-1 text-sm font-medium text-zinc-400">
            Sistemdeki skorlar, veritabanı sorguları ve çalıştırılabilir testler bağlanana kadar "Doğrulama Bekliyor" statüsündedir.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-500/20 bg-zinc-500/10 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Canlı Metrikler</div>
            <div className="text-lg font-black text-zinc-300">BAĞLANMADI</div>
          </div>
          <ShieldAlert className="h-10 w-10 text-yellow-500" />
        </div>
      </div>

      {/* Categories Breakdown Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-950/60 p-5 transition-all duration-300"
          >
            <div>
              <h3 className="text-base font-bold text-white">{cat.name}</h3>

              <ul className="mt-3 space-y-2">
                {cat.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-zinc-300">
                    <ListTodo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="inline-flex items-center gap-1.5 text-yellow-400/90">
                <FileClock className="h-3.5 w-3.5" /> {cat.status === "pending_verification" ? "Kanıt Bekliyor" : "Doğrulandı"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
