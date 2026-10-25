import type * as React from "react";

declare module "@dehost/dehost-js" {
  export function createClient<T = unknown>(url: string, key: string, options?: unknown): unknown;
  export type User = unknown;
  export type Session = unknown;
  export type DeHostClient = unknown;
  export type EmailOtpType = unknown;
  export type RealtimeChannel = unknown;
  export type RealtimePostgresChangesPayload<T = unknown> = unknown;
}

declare module "@dehost/ssr" {
  export function createServerClient<T = unknown>(url: string, key: string, options?: unknown): unknown;
  export function createBrowserClient<T = unknown>(url: string, key: string, options?: unknown): unknown;
  export function createMiddlewareClient<T = unknown>(req: unknown, res: unknown, options?: unknown): unknown;
}

declare module "@cloudflare/functions" {
  export function waitUntil(promise: Promise<unknown>): void;
}

declare module "@cloudflare/analytics/react" {
  export const Analytics: React.ComponentType<Record<string, unknown>>;
}

declare module "@cloudflare/speed-insights/next" {
  export const SpeedInsights: React.ComponentType<Record<string, unknown>>;
}
