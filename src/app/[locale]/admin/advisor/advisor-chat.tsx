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
    <div className="flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl backdrop-blur-xl md:flex-row">
      {/* Sol Panel: Profile & Bio */}
      <aside className="flex w-full shrink-0 flex-col items-center border-b border-white/20 bg-black/20 backdrop-blur-xl border-white/20 p-6 md:w-[280px] md:border-r md:border-b-0">
        <div className="relative mb-4">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-warning- to-warning- opacity-50 blur-sm" />
          <Image
            src="/brand-assets/ataturk-silhouette.svg"
            alt="Mustafa Kemal Atat├╝rk Sil├╝eti"
            width={130}
            height={130}
            priority
            className="relative rounded-full border-2 border-warning-/40 bg-black/80 p-2 shadow-inner"
          />
        </div>

        <h1 className="text-center font-serif text-lg font-bold tracking-wider text-warning-">
          MUSTAFA KEMAL ATAT├£RK
        </h1>
        <div className="mt-1 mb-5 font-mono text-xs tracking-widest text-warning-/80">
          1881 ÔÇö 1938
        </div>

        {/* Rozetler */}
        <div className="w-full space-y-2 text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-warning-/40 bg-warning-/20 px-3 py-2 text-warning-/90">
            <Award className="h-4 w-4 shrink-0 text-warning-" />
            <span>{t("gazi_commander_founder")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-warning-/40 bg-warning-/20 px-3 py-2 text-warning-/90">
            <Compass className="h-4 w-4 shrink-0 text-warning-" />
            <span>{t("gazi_reason_science")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-warning-/40 bg-warning-/20 px-3 py-2 text-warning-/90">
            <Sparkles className="h-4 w-4 shrink-0 text-warning-" />
            <span>{t("gazi_twin_architect")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-warning-/40 bg-warning-/20 px-3 py-2 text-warning-/90">
            <Shield className="h-4 w-4 shrink-0 text-warning-" />
            <span>{t("gazi_alpar_advisor")}</span>
          </div>
        </div>

        {/* Vecize */}
        <blockquote className="mt-auto border-l-2 border-warning-/50 py-2 pl-3 font-serif text-xs text-warning-/70 italic">
          {t("gazi_quote")}
        </blockquote>
      </aside>

      {/* Sa─ş Panel: Sohbet Alan─▒ */}
      <main className="flex flex-1 flex-col bg-bg-primary">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-warning-/20 bg-bg-secondary/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-warning-" />
            <div>
              <h2 className="font-serif text-base font-semibold text-warning-">
                {t("gazi_header_title")}
              </h2>
              <p className="text-xs text-warning-/70">{t("gazi_header_subtitle")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-/30 bg-warning-/10 px-3 py-1 text-xs font-medium text-warning-">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {t("gazi_active")}
          </span>
        </header>

        {/* Mesaj Listesi */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "ataturk" ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-lg transition-all duration-200 ease-out md:p-5 ${
                  msg.role === "ataturk"
                    ? "border border-warning-/30 bg-bg-elevated text-warning- shadow-warning-/20"
                    : "ml-auto border border-accent-/30 bg-accent-/30 text-accent- shadow-accent-/20"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap md:text-base ${
                    msg.role === "ataturk" ? "font-serif" : "font-sans"
                  }`}
                  style={{
                    fontFamily:
                      msg.role === "ataturk" ? "'Playfair Display', Georgia, serif" : "inherit",
                  }}
                >
                  {msg.content}
                </p>

                {/* Alt Bilgi & T├╝rk Bayra─ş─▒ */}
                <div
                  className={`mt-3 flex items-center justify-between border-t pt-2 font-mono text-xs ${
                    msg.role === "ataturk"
                      ? "border-warning-/20 text-warning-/70"
                      : "border-accent-/20 text-accent-/60"
                  }`}
                >
                  {msg.role === "ataturk" ? (
                    <span className="flex items-center gap-1.5 font-sans font-medium text-warning-/90">
                      <span role="img" aria-label="T├╝rk Bayra─ş─▒">
                        ­şç╣­şçÀ
                      </span>{" "}
                      Mustafa Kemal Atat├╝rk
                    </span>
                  ) : (
                    <span>{t("gazi_you")}</span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Animasyonlu D├╝┼ş├╝n├╝yor Baloncu─şu */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex max-w-[80%] animate-pulse items-center gap-3 rounded-2xl border border-warning-/40 bg-bg-elevated p-4 text-warning-/90 shadow-lg">
                <span className="font-serif text-sm font-medium italic">{t("gazi_thinking")}</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warning-" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warning- [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warning- [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Alan─▒ */}
        <form onSubmit={handleSubmit} className="border-t border-warning-/20 bg-bg-secondary p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paşam, size bir sorum var..."
              disabled={loading}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 transition-all duration-200 ease-out duration-200 ease-out focus:border-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-warning- to-warning- px-5 py-3 font-semibold text-warning- shadow-lg shadow-warning-/30 transition-all duration-200 ease-out hover:from-warning- hover:to-warning- disabled:opacity-50"
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
