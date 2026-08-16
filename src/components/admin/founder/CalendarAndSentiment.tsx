"use client";

import { Calendar, Smile } from "lucide-react";

export function CalendarAndSentiment() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sentiment Analysis */}
      <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-2 text-fuchsia-400">
              <Smile className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Duygu Analizi (Sentiment)</h3>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            %64 Pozitif
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-400">Marka Algısı</span>
              <span className="text-emerald-400 font-bold">%64</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[64%] bg-gradient-to-r from-emerald-500/50 to-emerald-400" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-400">Müşteri Memnuniyeti</span>
              <span className="text-cyan-400 font-bold">%82</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[82%] bg-gradient-to-r from-cyan-500/50 to-cyan-400" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Son 24 saatteki sosyal medya ve destek talebi etkileşimlerinden analiz edilmiştir.
          </p>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Takvim & Etkinlikler</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded bg-brand-500/20 text-brand-400">
              <span className="text-[10px] font-bold uppercase">Ağu</span>
              <span className="text-sm font-black">16</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Founder Core Lansmanı</p>
              <p className="text-xs text-zinc-400">10:00 - 12:00 | Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
              <span className="text-[10px] font-bold uppercase">Ağu</span>
              <span className="text-sm font-black">18</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Yatırımcı Sunumu</p>
              <p className="text-xs text-zinc-400">14:00 - 15:30 | HQ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
