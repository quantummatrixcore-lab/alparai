declare module '@sentry/nextjs' {
  export function init(options: any): void;
  export function captureException(exception: any, captureContext?: any): string;
  export function captureMessage(message: string, captureContext?: any): string;
}

declare module 'next-intl' {
  export function useTranslations(namespace?: string): any;
  export function useLocale(): string;
  export function NextIntlClientProvider(props: any): any;
  export type AbstractIntlMessages = any;
}

declare module 'next-intl/server' {
  export function getTranslations(opts?: any): Promise<any>;
  export function setRequestLocale(locale: string): void;
  export function getLocale(): Promise<string>;
  export function getMessages(opts?: any): Promise<any>;
  export function getRequestConfig(fn: any): any;
}

declare module 'next-intl/routing' {
  export const defineRouting: any;
}

declare module 'next-intl/navigation' {
  export const createNavigation: any;
}

declare module 'next-intl/middleware' {
  export default function createMiddleware(config: any): any;
}