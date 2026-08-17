"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Sparkles, Send, Shield, Award, Compass, BookOpen } from "lucide-react";

interface Message {
  id: string;
  role: "ataturk" | "user";
  content: string;
  timestamp: string;
}

export function AdvisorChat() {
  const t = useTranslations("admin");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      role: "ataturk",
      content: t("gazi_initial_message"),
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
      const res = await fetch("/api/admin/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = (await res.json()) as { reply?: string };
      const replyText = data.reply || t("gazi_error_message");

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
        content: t("gazi_error_message"),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur text-white shadow-2xl md:flex-row transition-all duration-200 ease-out">
      {/* Sol Panel: Profile & Bio */}
      <aside className="flex w-full shrink-0 flex-col items-center border-b border-white/20 bg-zinc-900/40 p-6 md:w-[280px] md:border-r md:border-b-0 transition-all duration-200 ease-out">
        <div className="relative mb-4">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 opacity-50 blur-sm" />
          <Image
            src="/brand-assets/ataturk-silhouette.svg"
            alt="Mustafa Kemal Atatürk Silüeti"
            width={130}
            height={130}
            priority
            className="relative rounded-full border-2 border-amber-500/40 bg-[#070709] p-2 shadow-inner"
          />
        </div>

        <h1 className="text-center font-serif text-lg font-bold tracking-wider text-amber-500">
          MUSTAFA KEMAL ATATÜRK
        </h1>
        <div className="mt-1 mb-5 font-mono text-xs tracking-widest text-amber-500/80">
          1881 — 1938
        </div>

        {/* Rozetler */}
        <div className="w-full space-y-2 text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-amber-500/90 transition-all duration-200 ease-out hover:bg-amber-500/30">
            <Award className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{t("gazi_commander_founder")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-amber-500/90 transition-all duration-200 ease-out hover:bg-amber-500/30">
            <Compass className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{t("gazi_reason_science")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-amber-500/90 transition-all duration-200 ease-out hover:bg-amber-500/30">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{t("gazi_twin_architect")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-amber-500/90 transition-all duration-200 ease-out hover:bg-amber-500/30">
            <Shield className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{t("gazi_alpar_advisor")}</span>
          </div>
        </div>

        {/* Vecize */}
        <blockquote className="mt-auto border-l-2 border-amber-500/50 py-2 pl-3 font-serif text-xs text-amber-500/70 italic">
          {t("gazi_quote")}
        </blockquote>
      </aside>

      {/* Sağ Panel: Sohbet Alanı */}
      <main className="flex flex-1 flex-col bg-[#070709] transition-all duration-200 ease-out">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-amber-500/20 bg-zinc-900/80 px-6 py-4 backdrop-blur-sm transition-all duration-200 ease-out">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <div>
              <h2 className="font-serif text-base font-semibold text-amber-500">
                {t("gazi_header_title")}
              </h2>
              <p className="text-xs text-amber-500/70">{t("gazi_header_subtitle")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {t("gazi_active")}
          </span>
        </header>

        {/* Mesaj Listesi */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6 bg-[#070709]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "ataturk" ? "items-start" : "items-end"} transition-all duration-200 ease-out`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-lg transition-all duration-200 ease-out md:p-5 ${
                  msg.role === "ataturk"
                    ? "border border-amber-500/30 bg-zinc-900 text-amber-500 shadow-amber-500/20"
                    : "ml-auto border border-brand-500/30 bg-brand-500/20 text-white shadow-brand-500/20"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap md:text-base ${
                    msg.role === "ataturk" ? "font-serif" : "font-sans"
                  }`}
                  style={{
                    fontFamily:
                      msg.role === "ataturk" ? "var(--font-display)" : "var(--font-sans)",
                  }}
                >
                  {msg.content}
                </p>

                {/* Alt Bilgi */}
                <div
                  className={`mt-3 flex items-center justify-between border-t pt-2 font-mono text-xs ${
                    msg.role === "ataturk"
                      ? "border-amber-500/20 text-amber-500/70"
                      : "border-brand-500/20 text-brand-500/60"
                  }`}
                >
                  {msg.role === "ataturk" ? (
                    <span className="flex items-center gap-1.5 font-sans font-medium text-amber-500/90">
                      <span role="img" aria-label="Türk Bayrağı">
                        🇹🇷
                      </span>{" "}
                      Mustafa Kemal Atatürk
                    </span>
                  ) : (
                    <span>{t("gazi_you")}</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Animasyonlu Düşünüyor Baloncuğu */}
          {loading && (
            <div className="flex flex-col items-start transition-all duration-200 ease-out">
              <div className="flex max-w-[80%] animate-pulse items-center gap-3 rounded-2xl border border-amber-500/40 bg-zinc-900 p-4 text-amber-500/90 shadow-lg">
                <span className="font-serif text-sm font-medium italic">{t("gazi_thinking")}</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500 [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Alanı */}
        <form onSubmit={handleSubmit} className="border-t border-amber-500/20 bg-zinc-900/80 p-4 backdrop-blur-sm transition-all duration-200 ease-out">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paşam, size bir sorum var..."
              disabled={loading}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-sm text-white placeholder-white/40 transition-all duration-200 ease-out focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 font-semibold text-zinc-900 shadow-lg shadow-amber-500/30 transition-all duration-200 ease-out hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{t("gazi_send")}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
