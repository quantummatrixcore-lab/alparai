"use client";

import { Activity, Server, Database, Cloud } from "lucide-react";

export function DeploymentLimitsWidget() {
  return (
    <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group">
      <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
        <Server className="w-5 h-5 text-emerald-500" />
        Platform Kapasite Sınırları
      </h2>
      
      <div className="space-y-4">
        {/* Vercel Limits */}
        <div className="border-b border-gray-800/50 pb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Vercel (Pro)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">Max RAM</span>
              <span className="font-mono text-emerald-400">8192 MB</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">Timeout</span>
              <span className="font-mono text-emerald-400">300s (Max)</span>
            </div>
          </div>
        </div>

        {/* Supabase Limits */}
        <div className="border-b border-gray-800/50 pb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Database className="w-4 h-4" /> Supabase
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">Bağlantı (Pool)</span>
              <span className="font-mono text-blue-400">Bilinmiyor</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">Veritabanı Boyutu</span>
              <span className="font-mono text-blue-400">8GB Limit</span>
            </div>
          </div>
        </div>

        {/* GitHub Limits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4" /> GitHub Actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">Runner RAM</span>
              <span className="font-mono text-purple-400">7 GB</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block mb-1">CPU Cores</span>
              <span className="font-mono text-purple-400">2 Çekirdek</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
