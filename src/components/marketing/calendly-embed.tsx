"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import { Calendar, Clock, ShieldCheck, Video, Mail, ExternalLink, Loader2 } from "lucide-react";

interface CalendlyEmbedProps {
  url?: string;
  title?: string;
  subtitle?: string;
  isTr?: boolean;
}

export function CalendlyEmbed({
  url = "https://calendly.com/alparai/advisory-board",
  title,
  subtitle,
  isTr = false,
}: CalendlyEmbedProps) {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    // If Script onLoad takes longer than 2.5s (e.g. adblocker), fallback to direct iframe
    const timer = setTimeout(() => {
      if (!widgetLoaded) {
        setUseIframeFallback(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [widgetLoaded]);

  return (
    <div className="border-border-subtle bg-bg-secondary/20 relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {/* Background ambient lighting */}
      <div className="bg-brand-500/10 pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[80px]" />

      {/* Header Info */}
      <div className="relative z-10 mb-8 text-center">
        <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-fg-primary text-2xl font-bold tracking-tight">
          {title ||
            (isTr
              ? "Danışma Kurulu Başvuru & Görüşme Randevusu"
              : "Advisory Board Application & Interview")}
        </h3>
        <p className="text-fg-secondary mx-auto mt-2 max-w-xl text-sm leading-relaxed">
          {subtitle ||
            (isTr
              ? "ALPAR AI Stratejik Danışma Kurulu üyelik değerlendirmesi için 30 dakikalık birebir görüşme randevunuzu takvimden oluşturabilirsiniz."
              : "Schedule a 30-minute 1-on-1 discovery and evaluation session for ALPAR AI Strategic Advisory Board membership.")}
        </p>

        {/* Feature Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="border-border-subtle bg-bg-tertiary/60 text-fg-secondary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium">
            <Clock className="text-brand-400 h-3.5 w-3.5" />
            {isTr ? "30 Dakika" : "30 Minutes"}
          </span>
          <span className="border-border-subtle bg-bg-tertiary/60 text-fg-secondary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium">
            <Video className="text-brand-400 h-3.5 w-3.5" />
            {isTr ? "Google Meet / Video" : "Google Meet / Video"}
          </span>
          <span className="border-border-subtle bg-bg-tertiary/60 text-fg-secondary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium">
            <ShieldCheck className="text-success-400 h-3.5 w-3.5" />
            {isTr ? "Gizli & Birebir" : "Confidential & 1-on-1"}
          </span>
        </div>
      </div>

      {/* External Script for Calendly Widget */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => setWidgetLoaded(true)}
      />

      {/* Calendly Container */}
      <div className="bg-bg-primary/50 relative z-10 min-h-[680px] w-full overflow-hidden rounded-xl">
        {!widgetLoaded && !useIframeFallback && (
          <div className="text-fg-muted absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
            <span className="text-xs font-medium">
              {isTr ? "Calendly takvimi yükleniyor..." : "Loading Calendly calendar..."}
            </span>
          </div>
        )}

        {!useIframeFallback ? (
          <div
            className="calendly-inline-widget min-h-[680px] w-full border-0"
            data-url={`${url}?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0f172a&text_color=f8fafc&primary_color=8b5cf6`}
            style={{ minWidth: "320px", height: "700px" }}
          />
        ) : (
          <div className="border-border-subtle bg-bg-secondary/30 flex min-h-[500px] w-full flex-col items-center justify-center rounded-xl border p-8 text-center backdrop-blur-sm">
            <div className="bg-brand-500/10 text-brand-400 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
            <h4 className="text-fg-primary mb-2 text-xl font-bold">
              {isTr ? "Takvim Yüklenemedi" : "Calendar Could Not Be Loaded"}
            </h4>
            <p className="text-fg-secondary mb-8 max-w-md text-sm">
              {isTr
                ? "Tarayıcı ayarlarınız (reklam engelleyici vb.) nedeniyle takvim arayüzü yüklenemedi. Lütfen randevu için doğrudan takvim sayfasını ziyaret edin veya e-posta gönderin."
                : "The calendar interface could not be loaded due to your browser settings (e.g., ad blocker). Please visit the calendar page directly or send an email to schedule."}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-500 shadow-brand-500/20 hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
              >
                <ExternalLink className="h-4 w-4" />
                {isTr ? "Takvimi Yeni Sekmede Aç" : "Open Calendar in New Tab"}
              </a>
              <a
                href="mailto:contact@alparai.com?subject=Advisory%20Board%20Application"
                className="border-border-subtle bg-bg-tertiary text-fg-primary hover:bg-bg-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-bold transition-colors"
              >
                <Mail className="h-4 w-4" />
                {isTr ? "E-posta Gönder" : "Send Email"}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer Alternative / Direct Link */}
      <div className="border-border-subtle/50 text-fg-muted relative z-10 mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 text-xs sm:flex-row">
        <span>
          {isTr
            ? "Calendly takvimi açılmıyor mu veya alternatif zaman mı gerekli?"
            : "Calendly calendar not displaying or need an alternative time?"}
        </span>
        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-semibold transition-colors"
          >
            <span>{isTr ? "Calendly'de Aç" : "Open in Calendly"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <span className="text-border-subtle">•</span>
          <a
            href="mailto:contact@alparai.com?subject=Advisory%20Board%20Direct%20Application"
            className="text-fg-secondary hover:text-fg-primary inline-flex items-center gap-1 font-semibold transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{isTr ? "E-posta ile İletişim" : "Contact via Email"}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
