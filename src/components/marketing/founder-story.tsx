"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Fingerprint } from "lucide-react";
import { Link } from "@/i18n/routing";

export function FounderStory() {
  const t = useTranslations("marketing.founder_story");

  return (
    <Section className="bg-bg-secondary/30 border-border-subtle border-b">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="bg-danger-500/10 border-danger-500/20 rounded-full border p-3">
              <AlertTriangle className="text-danger-400 h-6 w-6" />
            </div>
            <h2 className="text-fg-primary text-3xl font-extrabold sm:text-4xl">{t("title")}</h2>
          </div>

          <Card
            variant="elevated"
            className="border-danger-500/20 border-l-danger-500 from-bg-elevated/80 to-bg-elevated/40 relative overflow-hidden border-l-4 bg-gradient-to-b shadow-[0_0_50px_rgba(244,63,94,0.05)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute top-0 right-0 opacity-5">
              <Fingerprint className="-mt-20 -mr-20 h-96 w-96" />
            </div>

            <CardContent className="relative z-10 p-8 sm:p-12">
              <div className="text-fg-secondary space-y-6 text-lg leading-relaxed">
                <p>
                  <strong className="text-danger-400 mb-3 block text-2xl font-black tracking-tight">
                    {t("highlight")}
                  </strong>
                  {t("p1")}
                </p>
                <p>{t("p2")}</p>
                <div className="border-danger-500 bg-danger-500/5 text-fg-primary my-8 rounded-r-lg border-l-4 px-6 py-4 text-2xl font-black italic">
                  &ldquo;{t("quote")}&rdquo;
                </div>
                <p>{t("p3")}</p>

                <div className="border-t border-white/5 pt-8">
                  <p className="text-fg-muted mb-4 text-sm">{t("transition_p")}</p>
                  <Link
                    href="/submit"
                    className="bg-danger-500 hover:bg-danger-600 focus:ring-danger-500/50 inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-colors focus:ring-2 focus:outline-none"
                  >
                    {t("transition_cta")}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Section>
  );
}
