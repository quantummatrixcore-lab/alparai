"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Users, MessageSquare, Eye } from "lucide-react";

const steps = [
  { icon: Send, titleKey: "how_step_1_title", descKey: "how_step_1_desc" },
  { icon: Users, titleKey: "how_step_2_title", descKey: "how_step_2_desc" },
  { icon: MessageSquare, titleKey: "how_step_3_title", descKey: "how_step_3_desc" },
  { icon: Eye, titleKey: "how_step_4_title", descKey: "how_step_4_desc" },
] as const;

export function HowItWorks() {
  const t = useTranslations("hero");

  return (
    <Section className="bg-bg-secondary/30 reveal-on-scroll scroll-mt-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-fg-primary text-2xl font-bold sm:text-3xl">{t("how_title")}</h2>
          <p className="text-fg-secondary mt-4 text-lg">{t("how_subtitle")}</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  variant="default"
                  className="hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="bg-danger-500/10 text-danger-400 mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-fg-primary text-base">{t(step.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fg-secondary text-sm leading-relaxed">{t(step.descKey)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
