import { vi } from "vitest";

process.env.IP_SALT ??= "test-salt-must-be-at-least-16-chars";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.APP_URL ??= "http://localhost:3000";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

vi.mock("server-only", () => ({}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  getLocale: vi.fn().mockResolvedValue("en"),
  setRequestLocale: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  })),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn().mockImplementation(() => ({
      limit: vi.fn().mockResolvedValue({
        success: true,
        remaining: 10,
        reset: Date.now() + 60_000,
      }),
    })),
    {
      slidingWindow: vi.fn().mockReturnValue({} as never),
    },
  ),
}));
