import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { MainContent } from "@/components/layout/main-content";
import { LiveTicker } from "@/components/shared/live-ticker";
import {
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/json-ld";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/posthog-provider";

import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ClientProviders } from "@/components/client-providers";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PwaRegister } from "@/components/pwa-register";
import { PlausibleWithConsent } from "@/components/plausible-consent";
import { UtmTracker } from "@/components/analytics/utm-tracker";
import { ReferralTracker } from "@/components/marketing/referral-tracker";
import "../globals.css";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://alparai.com"),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const headerUser = null;

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isEmbed = pathname.endsWith("/embed");
  const dir = locale === "ar" || locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="bg-bg-primary text-fg-primary relative min-h-screen w-full overflow-x-hidden font-sans antialiased">
        <a
          href="#main-content"
          className="bg-brand-500 sr-only text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:outline-none"
        >
          {tCommon("skipToContent", { defaultValue: "Skip to main content" })}
        </a>
        <PostHogProvider>
          <NextIntlClientProvider messages={messages}>
            {isEmbed ? (
              <main className="m-0 min-h-screen bg-transparent p-0">{children}</main>
            ) : (
              <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-16 lg:pb-0">
                <div className="fixed top-0 right-0 left-0 z-[60]">
                  <LiveTicker />
                </div>
                <div className="mt-8">
                  <Header user={headerUser} />
                </div>
                <MainContent>{children}</MainContent>
                <Footer />
              </div>
            )}
            {!isEmbed && <MobileBottomNav />}
            <ClientProviders />
            {!isEmbed && <ScrollToTop />}
            <PwaRegister />
            <OrganizationJsonLd />
            <SoftwareApplicationJsonLd />
            <WebSiteJsonLd />
            <PlausibleWithConsent />
            <UtmTracker />
            <ReferralTracker />
            <Analytics />
            <SpeedInsights />
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
