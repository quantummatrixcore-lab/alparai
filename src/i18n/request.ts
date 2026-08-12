/**
 * i18n configuration for next-intl.
 */

import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import type { AbstractIntlMessages } from "next-intl";

const localeMessages: Record<Locale, () => Promise<{ default: AbstractIntlMessages }>> = {
  en: () => import("../../messages/en.json"),
  tr: () => import("../../messages/tr.json"),
  de: () => import("../../messages/de.json"),
  fr: () => import("../../messages/fr.json"),
  ru: () => import("../../messages/ru.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
    locale = DEFAULT_LOCALE;
  }

  let messages: AbstractIntlMessages;
  try {
    const loader = localeMessages[locale as Locale] ?? localeMessages[DEFAULT_LOCALE];
    messages = (await loader()).default;
  } catch {
    notFound();
  }

  return {
    locale,
    messages,
    timeZone: "Europe/Istanbul",
    now: new Date(),
  };
});
