"use client";

import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/layout";
import { Home, FileSearch, ArrowLeft, AlertCircle } from "lucide-react";

interface NotFoundClientProps {
  code: string;
  badge: string;
  title: string;
  description: string;
  homeLabel: string;
  homeDesc: string;
  incidentsLabel: string;
  incidentsDesc: string;
  backLabel: string;
}

export function NotFoundClient({
  code,
  badge,
  title,
  description,
  homeLabel,
  homeDesc,
  incidentsLabel,
  incidentsDesc,
  backLabel,
}: NotFoundClientProps) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      {/* Ambient background orbs (GPU-accelerated CSS animations) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-600/8 animate-float absolute -top-[20%] left-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-danger-500/10 animate-float-delayed absolute right-[15%] bottom-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <Container size="narrow" className="relative z-10 py-24 text-center">
        <div className="animate-fade-up flex flex-col items-center">
          {/* Badge */}
          <div>
            <div
              className="border-danger-500/30 bg-danger-500/5 text-danger-400 mb-6 inline-flex items-center gap-2 rounded-sm border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(230,57,70,0.15)]"
              role="status"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {badge}
            </div>
          </div>

          {/* 404 Number */}
          <p className="from-brand-300 via-danger-400 to-brand-500 text-2xl bg-gradient-to-r bg-clip-text font-black tracking-tighter text-transparent drop-shadow-2xl select-none md:text-[10rem] lg:text-[12rem]">
            {code}
          </p>

          {/* Title */}
          <h1 className="text-fg-primary mt-4 text-3xl font-black tracking-tight md:text-4xl">
            {title}
          </h1>

          {/* Description */}
          <p className="text-fg-secondary mt-4 max-w-xl text-base leading-relaxed md:text-lg">
            {description}
          </p>

          {/* Navigation cards */}
          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02]">
              <Link
                href="/"
                className="border-border-subtle bg-bg-secondary hover:border-brand-500/40 hover:shadow-brand-500/5 focus-visible:ring-brand-500 flex items-center gap-3 rounded-xl border p-5 text-left transition-all duration-300 ease-in-out hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div
                  className="bg-brand-500/10 border-brand-500/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                  aria-hidden="true"
                >
                  <Home className="text-brand-400 h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-primary text-sm font-semibold">{homeLabel}</p>
                  <p className="text-fg-muted mt-0.5 text-xs">{homeDesc}</p>
                </div>
              </Link>
            </div>

            <div className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02]">
              <Link
                href="/incidents"
                className="border-border-subtle bg-bg-secondary hover:border-brand-500/40 hover:shadow-brand-500/5 focus-visible:ring-brand-500 flex items-center gap-3 rounded-xl border p-5 text-left transition-all duration-300 ease-in-out hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div
                  className="bg-brand-500/10 border-brand-500/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                  aria-hidden="true"
                >
                  <FileSearch className="text-brand-400 h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-primary text-sm font-semibold">{incidentsLabel}</p>
                  <p className="text-fg-muted mt-0.5 text-xs">{incidentsDesc}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/"
              className="text-fg-muted hover:text-brand-400 focus-visible:ring-brand-500 inline-flex items-center gap-2 rounded-md text-sm font-semibold transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
