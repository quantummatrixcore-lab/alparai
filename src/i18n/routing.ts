/**
 * i18n routing — middleware + helpers.
 */

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/constants";

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
