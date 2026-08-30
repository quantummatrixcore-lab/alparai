declare module "@sentry/nextjs" {
  export interface SentryEventHint {
    syntheticException?: unknown;
    originalException?: unknown;
    data?: unknown;
  }

  export interface SentryExceptionValue {
    type?: string;
    value?: string;
    stacktrace?: unknown;
    mechanism?: unknown;
  }

  export interface SentryEvent {
    event_id?: string;
    message?: string;
    timestamp?: number;
    level?: "fatal" | "error" | "warning" | "log" | "info" | "debug";
    platform?: string;
    logger?: string;
    server_name?: string;
    release?: string;
    dist?: string;
    environment?: string;
    sdk?: Record<string, unknown>;
    request?: Record<string, unknown>;
    transaction?: string;
    modules?: Record<string, string>;
    fingerprint?: string[];
    exception?: {
      values?: SentryExceptionValue[];
    };
    breadcrumbs?: unknown[];
    contexts?: Record<string, unknown>;
    tags?: Record<string, string | number | boolean>;
    extra?: Record<string, unknown>;
    user?: Record<string, unknown>;
    type?: string;
  }

  export interface SentryOptions {
    dsn?: string;
    tracesSampleRate?: number;
    debug?: boolean;
    ignoreErrors?: (string | RegExp)[];
    beforeSend?: (event: SentryEvent, hint?: SentryEventHint) => SentryEvent | null | Promise<SentryEvent | null>;
    environment?: string;
    release?: string;
    [key: string]: unknown;
  }

  export function init(options: SentryOptions): void;
  export function captureException(exception: unknown, captureContext?: unknown): string;
  export function captureMessage(message: string, captureContext?: unknown): string;
  export function setUser(user: Record<string, unknown> | null): void;
  export function setTag(key: string, value: string | number | boolean): void;
  export function setExtra(key: string, extra: unknown): void;
}

declare module "next-intl" {
  export type AbstractIntlMessages = Record<string, unknown>;

  export interface TranslationValues {
    [key: string]: string | number | boolean | Date | undefined | null;
  }

  export interface IntlTranslationFunction {
    (key: string, values?: TranslationValues): string;
    rich(key: string, values?: Record<string, unknown>): import("react").ReactNode;
    markup(key: string, values?: Record<string, unknown>): string;
    raw(key: string): unknown;
    has(key: string): boolean;
  }

  export function useTranslations(namespace?: string): IntlTranslationFunction;
  export function useLocale(): string;
  export function useTimeZone(): string;
  export function useNow(options?: { updateInterval?: number }): Date;
  export function useFormatter(): unknown;

  export interface NextIntlClientProviderProps {
    locale?: string;
    messages?: AbstractIntlMessages;
    children?: import("react").ReactNode;
    timeZone?: string;
    now?: Date;
  }

  export function NextIntlClientProvider(props: NextIntlClientProviderProps): import("react").ReactElement;
}

declare module "next-intl/server" {
  import type { AbstractIntlMessages, IntlTranslationFunction } from "next-intl";

  export interface GetTranslationsOptions {
    locale?: string;
    namespace?: string;
  }

  export function getTranslations(
    opts?: string | GetTranslationsOptions
  ): Promise<IntlTranslationFunction>;

  export function setRequestLocale(locale: string): void;
  export function getLocale(): Promise<string>;
  export function getMessages(opts?: { locale?: string }): Promise<AbstractIntlMessages>;
  export function getTimeZone(opts?: { locale?: string }): Promise<string>;
  export function getNow(opts?: { locale?: string }): Promise<Date>;

  export interface RequestConfigParams {
    requestLocale: Promise<string | undefined> | string | undefined;
  }

  export interface RequestConfigResult {
    locale?: string;
    messages?: AbstractIntlMessages;
    timeZone?: string;
    now?: Date;
    [key: string]: unknown;
  }

  export function getRequestConfig(
    fn: (params: RequestConfigParams) => Promise<RequestConfigResult> | RequestConfigResult
  ): (params: RequestConfigParams) => Promise<RequestConfigResult>;
}

declare module "next-intl/routing" {
  export interface RoutingConfig<Locales extends readonly string[] = readonly string[]> {
    locales: Locales;
    defaultLocale: Locales[number];
    localePrefix?: "always" | "as-needed" | "never" | { mode?: string; prefixes?: Record<string, string> };
    localeDetection?: boolean;
    domains?: Array<{
      domain: string;
      defaultLocale: Locales[number];
      locales?: Locales;
    }>;
    pathnames?: Record<string, unknown>;
  }

  export function defineRouting<const T extends RoutingConfig>(config: T): T;
}

declare module "next-intl/navigation" {
  import type { ComponentType, AnchorHTMLAttributes } from "react";

  export interface NavigationHelpers<Routing = unknown> {
    Link: ComponentType<
      AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
        locale?: string;
        prefetch?: boolean;
        replace?: boolean;
        scroll?: boolean;
        shallow?: boolean;
      }
    >;
    redirect: (url: string | { href: string; locale?: string }) => void;
    permanentRedirect: (url: string | { href: string; locale?: string }) => void;
    usePathname: () => string;
    useRouter: () => {
      push: (url: string, options?: { scroll?: boolean; locale?: string }) => void;
      replace: (url: string, options?: { scroll?: boolean; locale?: string }) => void;
      back: () => void;
      forward: () => void;
      refresh: () => void;
      prefetch: (url: string, options?: { locale?: string }) => void;
    };
    getPathname: (params: { href: string; locale?: string }) => string;
  }

  export function createNavigation<T>(routing: T): NavigationHelpers<T>;
}

declare module "next-intl/middleware" {
  import type { NextRequest, NextResponse } from "next/server";

  export interface MiddlewareOptions {
    locales: readonly string[];
    defaultLocale: string;
    localePrefix?: "always" | "as-needed" | "never" | Record<string, unknown>;
    localeDetection?: boolean;
    [key: string]: unknown;
  }

  export default function createMiddleware(
    config: MiddlewareOptions | Record<string, unknown>
  ): (request: NextRequest) => NextResponse;
}
