import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { NotFoundClient } from "@/components/ui/not-found-client";
import "./globals.css";

export async function generateMetadata() {
  try {
    const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "errors" });
    return { title: t("notFoundTitle") };
  } catch {
    return { title: "Page not found" };
  }
}

export default async function NotFound() {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "errors" });
  const tNav = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "nav" });
  const messages = await getMessages({ locale: DEFAULT_LOCALE });

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body className="bg-bg-primary text-fg-primary min-h-screen font-sans antialiased">
        <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={messages}>
          <NotFoundClient
            code="404"
            badge={t("error_404")}
            title={t("notFoundTitle")}
            description={t("notFoundDesc")}
            homeLabel={t("goHome")}
            homeDesc={t("goHomeDesc")}
            incidentsLabel={tNav("incidents")}
            incidentsDesc={t("browseDesc")}
            backLabel={t("goBack")}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
