// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';

// Founder Admin Panel v2 - Agent-OS Premium UI
export default function FounderAdminPanel() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-emerald-400 font-mono tracking-widest text-sm uppercase">Agent-OS Karargahı Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-gray-900/40 backdrop-blur-md border border-gray-800 p-4 rounded-2xl mb-8 shadow-2xl shadow-emerald-900/10 transition-all hover:border-emerald-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-300">
              ALPAR AI COMMAND CENTER
            </h1>
            <p className="text-xs text-gray-400 font-mono">Kurucu İrade: Ercüment Erden • Founder Admin Panel v2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-mono text-emerald-400">SÜRÜ OTOPİLOT: AKTİF</span>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sürü Yönetim & RAM */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
          <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Sürü Yönetimi (Gazi)
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
              <span className="text-sm text-gray-500">Aktif Ajanlar</span>
              <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">4 Sürü</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
              <span className="text-sm text-gray-500">Auto-Kill Çöp Toplayıcı</span>
              <span className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Devrede</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">RAM Tüketimi</span>
              <span className="text-sm font-mono text-gray-300">Stabil (1.2 GB)</span>
            </div>
          </div>
        </div>

        {/* Ana Zeka (Gemini & Oracle) */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
          <h2 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            Omni-Hafıza & Zeka
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
              <span className="text-sm text-gray-500">Google AI Studio</span>
              <span className="text-sm font-mono text-emerald-400">Gemini 1.5 Pro</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
              <span className="text-sm text-gray-500">Oracle (NotebookLM)</span>
              <span className="text-sm font-mono text-purple-400">Senkronize</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">Zeka Rotatörü</span>
              <span className="text-sm font-mono text-gray-300">Standby (Groq)</span>
            </div>
          </div>
        </div>

        {/* Stripe Bütçe Kilidi */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 group">
          <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Stripe Bütçe Kilidi
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Günlük Harcama Limit ($5)</span>
                <span className="text-white font-mono">$0.85</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full" style={{ width: '17%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-end border-b border-gray-800/50 pb-2 mt-4">
              <span className="text-sm text-gray-500">Hard-Stop Devresi</span>
              <span className="text-sm font-mono text-emerald-400">Aktif (Zero-Cost Mode)</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">Kalan Bütçe</span>
              <span className="text-sm font-mono text-amber-400">$4.15</span>
            </div>
          </div>
        </div>

        {/* Siber Güvenlik (Cloudflare & Hunter) */}
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 lg:col-span-2 hover:border-red-500/50 transition-all duration-300">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Hunter Agent & WAF Surları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Cloudflare WAF</p>
              <p className="text-xl font-bold text-gray-200">Kalkanlar Nöbette</p>
              <div className="mt-3 text-xs flex gap-2">
                <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-800/50">Under Attack: Kapalı</span>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Avcı Ajan (OSINT)</p>
              <p className="text-xl font-bold text-red-400">HackerOne Devriyesi</p>
              <div className="mt-3 text-xs flex gap-2">
                <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-800/50">Zero-Day Alarmı Yok</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kurucu İrade CDP */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/20 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Kurucu CDP Sync
          </h2>
          <div className="flex flex-col gap-3 justify-center items-center h-32">
            <div className="w-16 h-16 rounded-full bg-cyan-900/30 border border-cyan-700/50 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-xl">EE</span>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Ercüment Erden</p>
              <p className="text-xs text-cyan-400 mt-1">Google Dev Expert • ALPAR Kurucu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
