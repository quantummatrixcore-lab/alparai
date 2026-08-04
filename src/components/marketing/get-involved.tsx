"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldAlert, Newspaper, Scale, Microscope } from "lucide-react";

const ctas = [
  {
    icon: ShieldAlert,
    titleKey: "join_segment_public_title",
    descKey: "join_segment_public_desc",
    btnKey: "join_segment_public_btn",
    tagKey: "join_segment_public_tag",
    href: "/submit",
    primary: true,
  },
  {
    icon: Newspaper,
    titleKey: "join_segment_journalist_title",
    descKey: "join_segment_journalist_desc",
    btnKey: "join_segment_journalist_btn",
    tagKey: "join_segment_journalist_tag",
    href: "/dashboard/journalist",
    primary: false,
  },
  {
    icon: Scale,
    titleKey: "join_segment_legal_title",
    descKey: "join_segment_legal_desc",
    btnKey: "join_segment_legal_btn",
    tagKey: "join_segment_legal_tag",
    href: "/dashboard/legal",
    primary: false,
  },
  {
    icon: Microscope,
    titleKey: "join_segment_safety_title",
    descKey: "join_segment_safety_desc",
    btnKey: "join_segment_safety_btn",
    tagKey: "join_segment_safety_tag",
    href: "/dashboard/safety",
    primary: false,
  },
] as const;

export function GetInvolved() {
  const t = useTranslations("hero");

  return (
    <Section className="bg-bg-secondary/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-fg-primary text-2xl font-bold sm:text-3xl">{t("join_title")}</h2>
          <p className="text-fg-secondary mt-4 text-lg">{t("join_subtitle")}</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ctas.map((cta, i) => {
            const Icon = cta.icon;
            return (
              <motion.div
                key={cta.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <Link href={cta.href} className="block h-full">
                  <Card
                    variant={cta.primary ? "gradient" : "default"}
                    className="relative flex h-full flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                              cta.primary
                                ? "bg-danger-500/10 text-danger-400"
                                : "bg-brand-500/10 text-brand-400"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {cta.tagKey && (
                            <span className="text-fg-secondary rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                              {t(cta.tagKey)}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-fg-primary mt-4 text-base">
                          {t(cta.titleKey)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-fg-secondary text-sm leading-relaxed">
                          {t(cta.descKey)}
                        </p>
                      </CardContent>
                    </div>
                    <div className="px-6 pb-6">
                      <div
                        className={`inline-flex items-center gap-1 text-sm font-bold transition-all ${
                          cta.primary
                            ? "text-danger-400 group-hover:text-danger-300"
                            : "text-brand-400 group-hover:text-brand-300"
                        }`}
                      >
                        {t(cta.btnKey)}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
