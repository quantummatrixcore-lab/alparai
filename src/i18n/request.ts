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
};

export default getRequestConfig(
  async ({
    requestLocale,
  }: {
    requestLocale?: Promise<string | undefined> | string | undefined;
  }) => {
    let locale = await requestLocale;
    if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
      locale = DEFAULT_LOCALE;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: AbstractIntlMessages = {} as any;
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
  },
);
