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
import { fontSans, fontDisplay, fontMono } from "@/lib/fonts";
import { PostHogProvider } from "@/components/posthog-provider";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ClientProviders } from "@/components/client-providers";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PwaRegister } from "@/components/pwa-register";
import { DeferredTelemetry } from "@/components/analytics/deferred-telemetry";
import { ThemeProvider } from "next-themes";
import { constructPageMetadata } from "@/lib/seo/metadata";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return constructPageMetadata({
    locale,
    pathname: "",
  });
}

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
    return null;
  }
  setRequestLocale(locale);
  const messages = (await getMessages()) as Record<string, any>;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const headerUser = null;

  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") || headersList.get("x-middleware-request-x-pathname") || "";
  const isEmbed = pathname.endsWith("/embed");
  const isAuth =
    pathname.includes("/auth/") ||
    pathname.startsWith("/auth") ||
    /^\/[a-z]{2}\/auth/.test(pathname);
  const isAdmin =
    pathname.includes("/admin") ||
    pathname.includes("/admin-v2") ||
    /^\/[a-z]{2}\/admin/.test(pathname);
  const dir = locale === "ar" || locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`overflow-x-clip max-w-full ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head></head>
      <body className="bg-bg-primary text-fg-primary relative min-h-screen w-full max-w-full overflow-x-clip font-sans antialiased">
        <a
          href="#main-content"
          className="bg-brand-500 sr-only text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:outline-none"
        >
          {tCommon("skipToContent", { defaultValue: "Skip to main content" })}
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PostHogProvider>
            <NextIntlClientProvider messages={messages}>
              {isEmbed || isAdmin || isAuth ? (
                <main className="m-0 min-h-screen w-full max-w-full overflow-x-clip bg-transparent p-0">
                  {children}
                </main>
              ) : (
                <div className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-clip pb-16 lg:pb-0">
                  <div className="fixed top-0 right-0 left-0 z-[60] w-full max-w-full overflow-hidden">
                    <LiveTicker />
                  </div>
                  <div className="mt-8">
                    <Header user={headerUser} />
                  </div>
                  <MainContent>{children}</MainContent>
                  <Footer />
                </div>
              )}
              {!isEmbed && !isAdmin && !isAuth && <MobileBottomNav />}
              <ClientProviders />
              {!isEmbed && !isAdmin && !isAuth && <ScrollToTop />}
              <PwaRegister />
              <OrganizationJsonLd />
              <SoftwareApplicationJsonLd />
              <WebSiteJsonLd />
              <DeferredTelemetry />
            </NextIntlClientProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
