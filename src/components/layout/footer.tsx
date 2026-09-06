"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Wordmark } from "./wordmark";
import { Github, Twitter, Mail, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { usePathname } from "next/navigation";

const platformLinks = [
  { href: "/constitution", key: "constitution" },
  { href: "/incidents", key: "incidents" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/dilemmas", key: "dilemmas" },
  { href: "/submit", key: "submit_report" },
] as const;

const companyLinks = [
  { href: "/about", key: "about" },
  { href: "/about/advisory-board", key: "advisory_board" },
  { href: "/pricing", key: "pricing" },
  { href: "/trust-center", key: "security" },
  { href: "/academy", key: "academy" },
] as const;

const resourcesLinks = [
  { href: "/blog", key: "blog" },
  { href: "/methodology/k-benchmark", key: "methodology" },
  { href: "/ai-act", key: "ai_act" },
  { href: "/transparency", key: "transparency" },
  { href: "/api-docs", key: "apidocs" },
] as const;

const legalAndContactLinks = [
  { href: "/legal/privacy", key: "privacy", isEmail: false },
  { href: "/legal/terms", key: "terms", isEmail: false },
  { href: "/legal/cookies", key: "cookies", isEmail: false },
  { href: "mailto:contact@alparai.com", key: "contact@alparai.com", isEmail: true },
  { href: "mailto:academy@alparai.com", key: "academy@alparai.com", isEmail: true },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const isAdmin =
    pathname &&
    (/^\/(?:en|tr|[a-z]{2})\/admin(-v2)?(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin") ||
      pathname.includes("/admin-v2") ||
      pathname.includes("/admin/"));

  if (isAdmin) {
    return null;
  }

  return (
    <footer className="border-border-subtle bg-bg-secondary border-t">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Info (4 cols) */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4">
            <Wordmark size="sm" showTagline />
            <p className="text-fg-muted max-w-sm text-xs leading-relaxed">{t("tagline")}</p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/quantummatrixcore-lab/Alparai.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label={tCommon("github", { defaultValue: "GitHub" })}
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/alparai?utm_source=alparai_footer"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label={tCommon("twitter", { defaultValue: "Twitter" })}
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/alpar-ai?ref=alparai_platform&utm_source=alparai_footer"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label={tCommon("linkedin", { defaultValue: "LinkedIn" })}
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@alparai.com"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label={tCommon("email", { defaultValue: "Email" })}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            <div className="border-success-500/20 inline-flex items-center gap-2 rounded-full border bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>Sistemler Çevrimiçi · Canlı Doğrulama</span>
            </div>
          </div>

          {/* Platform (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.platform")}
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-0.5 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.company")}
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-0.5 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.resources")}
            </h4>
            <ul className="space-y-2">
              {resourcesLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-0.5 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.legal")} & {t("sections.contact")}
            </h4>
            <ul className="space-y-2">
              {legalAndContactLinks.map((l) => (
                <li key={l.href}>
                  {l.isEmail ? (
                    <a
                      href={l.href}
                      className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-0.5 text-xs transition-colors"
                    >
                      {l.key}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-0.5 text-xs transition-colors"
                    >
                      {t(`links.${l.key}`)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border-subtle mt-12 flex flex-col gap-4 border-t pt-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-fg-muted text-xs">{t("copyright")}</p>
          <p className="text-fg-muted text-xs">{t("platformStatus")}</p>
        </div>
      </Container>
    </footer>
  );
}
