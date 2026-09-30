declare module "@dehost/dehost-js" {
  export function createClient<T = any>(url: string, key: string, options?: any): any;
  export type User = any;
  export type Session = any;
  export type DeHostClient = any;
  export type DeHostClient = any;
  export type EmailOtpType = any;
  export type RealtimeChannel = any;
  export type RealtimePostgresChangesPayload<T = any> = any;
}

declare module "@dehost/ssr" {
  export function createServerClient<T = any>(url: string, key: string, options?: any): any;
  export function createBrowserClient<T = any>(url: string, key: string, options?: any): any;
  export function createMiddlewareClient<T = any>(req: any, res: any, options?: any): any;
}

declare module "@cloudflare/functions" {
  export function waitUntil(promise: Promise<any>): void;
}

declare module "@cloudflare/analytics/react" {
  export const Analytics: any;
}

declare module "@cloudflare/speed-insights/next" {
  export const SpeedInsights: any;
}
