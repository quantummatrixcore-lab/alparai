"use client";

import { Calendar, Smile } from "lucide-react";

export function CalendarAndSentiment() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sentiment Analysis */}
      <div className="border-border-subtle/50 flex flex-col justify-between rounded-2xl border bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-2 text-fuchsia-400">
              <Smile className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Duygu Analizi (Sentiment)</h3>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            Ölçülmedi
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-fg-muted">Genel Sentiment</span>
              <span className="font-bold text-emerald-400">Ölçülmedi</span>
            </div>
            <div className="bg-bg-elevated h-1.5 w-full overflow-hidden rounded-full">
              <div className="h-full w-0 bg-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-fg-muted">İş/Yaşam Dengesi (Tahmini)</span>
              <span className="font-bold text-amber-400">Ölçülmedi</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[82%] bg-gradient-to-r from-cyan-500/50 to-cyan-400" />
            </div>
          </div>
          <p className="text-fg-muted mt-2 text-xs">
            Son 24 saatteki sosyal medya ve destek talebi etkileşimlerinden analiz edilmiştir.
          </p>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="border-border-subtle/50 flex flex-col justify-between rounded-2xl border bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Takvim & Etkinlikler</h3>
        </div>
        <div className="space-y-3">
          <div className="border-border-subtle/50 bg-bg-primary/20 flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-brand-500/20 text-brand-400 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded">
              <span className="text-[10px] font-bold uppercase">Ağu</span>
              <span className="text-sm font-black">16</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Founder Core Lansmanı</p>
              <p className="text-fg-muted text-xs">10:00 - 12:00 | Online</p>
            </div>
          </div>
          <div className="border-border-subtle/50 bg-bg-primary/20 flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
              <span className="text-[10px] font-bold uppercase">Ağu</span>
              <span className="text-sm font-black">18</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Yatırımcı Sunumu</p>
              <p className="text-fg-muted text-xs">14:00 - 15:30 | HQ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
