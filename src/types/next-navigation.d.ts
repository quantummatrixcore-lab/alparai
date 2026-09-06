import type { _ReadonlyURLSearchParams } from "next/dist/shared/lib/hooks-client-types";

declare module "next/navigation" {
  export interface AppRouterInstance {
    back(): void;
    forward(): void;
    refresh(): void;
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    prefetch(href: string): void;
  }

  export enum RedirectType {
    push = "push",
    replace = "replace",
  }

  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<
    T extends Record<string, string | string[]> = Record<string, string | string[]>,
  >(): T;
  export function useSelectedLayoutSegments(parallelRouteKey?: string): string[];
  export function useSelectedLayoutSegment(parallelRouteKey?: string): string | null;
  export function redirect(url: string, type?: RedirectType): never;
  export function permanentRedirect(url: string, type?: RedirectType): never;
  export function notFound(): never;
}
