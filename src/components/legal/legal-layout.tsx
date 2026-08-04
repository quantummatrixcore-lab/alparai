"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/layout";
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("legal");
  const locale = useLocale();
  return (
    <Container size="narrow" className="py-12">
      <Link
        href="/"
        className="text-fg-muted hover:text-brand-400 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("back")}
      </Link>
      <header className="border-border-subtle mt-6 border-b pb-6">
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-fg-muted mt-2 text-sm">
          {t("last_updated")}: {formatDate(new Date(lastUpdated), locale)}
        </p>
      </header>
      <div className="prose prose-invert text-fg-primary mt-6 max-w-none">{children}</div>
    </Container>
  );
}
