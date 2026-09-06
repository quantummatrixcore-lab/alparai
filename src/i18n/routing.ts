/**
 * i18n routing — middleware + helpers.
 *
 * This module must NOT carry "use client". The server layout reads
 * routing.locales in generateStaticParams; behind a client boundary that
 * property resolves to undefined and the build fails while collecting page
 * data. The navigation hooks below are client-only by nature and the
 * components that call them declare "use client" themselves.
 */

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/constants";

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeDetection: false,
});

export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
