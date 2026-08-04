"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Wordmark } from "./wordmark";
import { Github, Twitter, Mail, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { usePathname } from "next/navigation";

const platformLinks = [
  { href: "/incidents", key: "incidents" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/dilemmas", key: "dilemmas" },
  { href: "/submit", key: "submit_report" },
  { href: "/transparency", key: "transparency" },
  { href: "/ai-act", key: "ai_act" },
  { href: "/challenges", key: "challenges" },
] as const;

const companyLinks = [
  { href: "/about", key: "about" },
  { href: "/about/advisory-board", key: "advisory_board" },
  { href: "/pricing", key: "pricing" },
  { href: "/security", key: "security" },
  { href: "/academy", key: "academy" },
  { href: "/press-kit", key: "presskit" },
] as const;

const resourcesLinks = [
  { href: "/blog", key: "blog", label: "Blog", external: false },
  { href: "/methodology/k-benchmark", key: "methodology", label: "K-BENCHMARK", external: false },
  {
    href: "https://github.com/quantummatrixcore-lab/Alparai.com",
    key: "github",
    label: "GitHub",
    external: true,
  },
  { href: "/api-docs", key: "apidocs", label: "API Docs", external: false },
] as const;

const legalLinks = [
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/terms", key: "terms" },
  { href: "/legal/cookies", key: "cookies" },
  { href: "/dmca", key: "dmca" },
  { href: "/moderation", key: "moderation" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const isAdmin =
    pathname &&
    (/^\/(?:en|tr)\/admin(?:\/|$)/.test(pathname) ||
      pathname === "/admin" ||
      pathname.startsWith("/admin"));

  if (isAdmin) {
    return null;
  }

  return (
    <footer className="border-border-subtle bg-bg-secondary border-t">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 lg:col-span-1">
            <Wordmark size="sm" showTagline />
            <p className="text-fg-muted text-xs leading-relaxed">{t("tagline")}</p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/quantummatrixcore-lab/Alparai.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-md"
                aria-label={tCommon("github", { defaultValue: "GitHub" })}
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/alparai"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-md"
                aria-label={tCommon("twitter", { defaultValue: "Twitter" })}
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/alpar-ai"
                target="_blank"
                rel="noreferrer noopener"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-md"
                aria-label={tCommon("linkedin", { defaultValue: "LinkedIn" })}
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@alparai.com"
                className="text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary inline-flex h-8 w-8 items-center justify-center rounded-md"
                aria-label={tCommon("email", { defaultValue: "Email" })}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.platform")}
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.company")}
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.resources")}
            </h4>
            <ul className="space-y-2">
              {resourcesLinks.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 text-xs transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 text-xs transition-colors"
                    >
                      {t(`links.${l.key}`)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.legal")}
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-fg-muted hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 text-xs transition-colors"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Contact */}
          <div>
            <h4 className="text-fg-primary mb-3 text-xs font-black tracking-wider uppercase">
              {t("sections.contact")}
            </h4>
            <ul className="text-fg-muted space-y-2 text-xs">
              <li>
                <a
                  href="mailto:hello@alparai.com"
                  className="hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 transition-colors"
                >
                  hello@alparai.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:academy@alparai.com"
                  className="hover:text-brand-400 inline-flex min-h-[24px] items-center py-1 transition-colors"
                >
                  academy@alparai.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border-subtle mt-12 flex flex-col gap-4 border-t pt-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-fg-muted text-xs">
            © 2026 ALPAR AI. Open Source (AGPL-3.0). EU Hosted. GDPR + KVKK Compliant.
          </p>
          <p className="text-fg-muted text-xs">{t("platformStatus")}</p>
        </div>
      </Container>
    </footer>
  );
}
