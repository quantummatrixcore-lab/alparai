"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container, Section } from "@/components/ui/layout";
import Link from "next/link";
import { ShieldAlert, Compass } from "lucide-react";

export function ClosingSection() {
  const t = useTranslations("hero");

  return (
    <Section className="border-border-subtle border-t">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center text-left"
          >
            <h2 className="text-fg-primary text-3xl font-black tracking-tight sm:text-4xl">
              {t("closing_title")}
            </h2>
            <p className="text-fg-secondary mt-6 text-base leading-relaxed font-medium">
              {t("closing_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/submit"
                className="group bg-danger-500 hover:bg-danger-400 relative inline-flex h-12 items-center justify-center gap-3 rounded-md px-8 text-base font-black text-white shadow-[0_0_20px_rgba(230,57,70,0.3)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_35px_rgba(230,57,70,0.6)]"
              >
                <ShieldAlert className="h-5 w-5" />
                {t("cta_primary")}
              </Link>
              <Link
                href="/insights"
                className="border-border-subtle bg-bg-secondary/80 hover:bg-bg-tertiary hover:border-brand-500/30 text-fg-primary relative inline-flex h-12 items-center justify-center gap-2 rounded-md border px-6 text-base font-bold transition-all duration-300 hover:-translate-y-0.5"
              >
                <Compass className="text-brand-400 h-5 w-5" />
                {t("cta_explore_data")}
              </Link>
            </div>
          </motion.div>

          {/* Right Block: The Good News / Hope Balance */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-brand-500/20 bg-brand-500/5 flex flex-col justify-center rounded-2xl border p-8 backdrop-blur-sm"
          >
            <h3 className="text-brand-400 text-2xl font-black tracking-tight">
              {t("closing_good_news_title")}
            </h3>
            <p className="text-fg-secondary mt-4 text-sm leading-relaxed font-medium">
              {t("closing_good_news_body")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/submit"
                className="text-brand-400 hover:text-brand-300 decoration-brand-500/30 text-sm font-bold underline decoration-2 underline-offset-4 transition-colors"
              >
                {t("closing_good_news_cta")}
              </Link>
              <span className="text-fg-muted">•</span>
              <Link
                href="/insights"
                className="text-fg-secondary hover:text-fg-primary text-sm font-medium transition-colors"
              >
                {t("cta_view_platform")}
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
