"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Send, Shield, Award, Compass, BookOpen } from "lucide-react";

interface Message {
  id: string;
  role: "ataturk" | "user";
  content: string;
  timestamp: string;
}

export function GaziChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      role: "ataturk",
      content:
        "Efendiler, Türk milletinin geleceğini akıl, bilim ve hesap verebilirlik ilkeleri üzerine inşa etmek mecburiyetindeyiz. ALPAR AI platformu hususunda suallerinizi ve stratejik görüşlerinizi beklerim.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/gazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = (await res.json()) as { reply?: string };
      const replyText = data.reply || "Cevap alınamadı.";

      const gaziMsg: Message = {
        id: `gazi-${Date.now()}`,
        role: "ataturk",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, gaziMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "ataturk",
        content: "Bağlantıda bir aksaklık meydana geldi. Hakikati aramaktan sarfınazar etmeyiniz.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-amber-900/30 bg-[#080808] text-white shadow-2xl md:flex-row">
      {/* Sol Panel: Profile & Bio */}
      <aside className="flex w-full shrink-0 flex-col items-center border-b border-amber-900/30 bg-[#0c0a09] p-6 md:w-[280px] md:border-r md:border-b-0">
        <div className="relative mb-4">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-900 blur-sm opacity-50" />
          <Image
            src="/brand-assets/ataturk-silhouette.svg"
            alt="Mustafa Kemal Atatürk Silüeti"
            width={130}
            height={130}
            priority
            className="relative rounded-full border-2 border-amber-500/40 bg-black/80 p-2 shadow-inner"
          />
        </div>

        <h1 className="text-center font-serif text-lg font-bold tracking-wider text-amber-200">
          MUSTAFA KEMAL ATATÜRK
        </h1>
        <div className="mt-1 mb-5 font-mono text-xs tracking-widest text-amber-500/80">
          1881 — 1938
        </div>

        {/* Rozetler */}
        <div className="w-full space-y-2 text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-200/90">
            <Award className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Başkomutan &amp; Kurucu</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-200/90">
            <Compass className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Akıl &amp; Bilim Rehberi</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-200/90">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Dijital İkiz Mimarı</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-amber-200/90">
            <Shield className="h-4 w-4 shrink-0 text-amber-400" />
            <span>ALPAR AI Danışmanı</span>
          </div>
        </div>

        {/* Vecize */}
        <blockquote className="mt-auto border-l-2 border-amber-700/50 pl-3 py-2 text-xs italic font-serif text-amber-300/70">
          &quot;Hayatta en hakiki mürşit ilimdir, fendir.&quot;
        </blockquote>
      </aside>

      {/* Sağ Panel: Sohbet Alanı */}
      <main className="flex flex-1 flex-col bg-[#080808]">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-amber-900/20 bg-[#0c0a09]/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="font-serif text-base font-semibold text-amber-100">
                GAZİ — Dijital İkiz Söyleşisi
              </h2>
              <p className="text-xs text-amber-500/70">
                Gemini 2.5 Pro · Yapay Zekâ Hesap Verebilirliği ve Strateji
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        </header>

        {/* Mesaj Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "ataturk" ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 md:p-5 shadow-lg transition-all ${
                  msg.role === "ataturk"
                    ? "bg-[#1a1209] border border-amber-800/30 text-amber-100 shadow-amber-950/20"
                    : "bg-blue-900/30 border border-blue-700/30 text-blue-100 shadow-blue-950/20 ml-auto"
                }`}
              >
                <p
                  className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === "ataturk" ? "font-serif" : "font-sans"
                  }`}
                  style={{
                    fontFamily:
                      msg.role === "ataturk"
                        ? "'Playfair Display', Georgia, serif"
                        : "inherit",
                  }}
                >
                  {msg.content}
                </p>

                {/* Alt Bilgi & Türk Bayrağı */}
                <div
                  className={`mt-3 flex items-center justify-between border-t pt-2 text-xs font-mono ${
                    msg.role === "ataturk"
                      ? "border-amber-800/20 text-amber-500/70"
                      : "border-blue-700/20 text-blue-400/60"
                  }`}
                >
                  {msg.role === "ataturk" ? (
                    <span className="flex items-center gap-1.5 font-sans font-medium text-amber-300/90">
                      <span role="img" aria-label="Türk Bayrağı">
                        🇹🇷
                      </span>{" "}
                      Mustafa Kemal Atatürk
                    </span>
                  ) : (
                    <span>Siz</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Animasyonlu Düşünüyor Baloncuğu */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="max-w-[80%] rounded-2xl border border-amber-800/40 bg-[#1a1209] p-4 text-amber-300/90 shadow-lg animate-pulse flex items-center gap-3">
                <span className="font-serif text-sm italic font-medium">
                  ...düşünüyor
                </span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Alanı */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-amber-900/20 bg-[#0c0a09] p-4"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Gazi'ye sualinizi iletin..."
              disabled={loading}
              className="flex-1 rounded-xl border border-amber-800/40 bg-[#111] px-4 py-3 text-sm text-white placeholder-amber-900/60 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 px-5 py-3 font-semibold text-amber-950 shadow-lg shadow-amber-900/30 transition-all hover:from-amber-600 hover:to-amber-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Gönder</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
