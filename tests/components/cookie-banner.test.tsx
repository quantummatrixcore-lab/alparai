// @vitest-environment jsdom
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, describe, beforeEach, vi } from "vitest";
import { CookieBanner } from "@/components/legal/cookie-banner";

// Mock next-intl and routing Link
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/actions/cookie-consent", () => ({
  logCookieConsent: vi.fn().mockResolvedValue({ ok: true }),
}));

describe("CookieBanner Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("shows banner when no consent is set", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("cookieTitle")).toBeDefined();
  });

  test("does not show banner when consent is set", () => {
    localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({
        consent: { necessary: true, analytics: false, marketing: false },
        at: Date.now(),
      }),
    );
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("saves full consent when accept button clicked", () => {
    render(<CookieBanner />);
    const acceptBtn = screen.getByText("cookieAccept");
    fireEvent.click(acceptBtn);

    const raw = localStorage.getItem("alpar_cookie_consent") || "{}";
    const parsed = JSON.parse(raw);
    expect(parsed.consent.necessary).toBe(true);
    expect(parsed.consent.analytics).toBe(true);
    expect(parsed.consent.marketing).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("saves essential-only consent when essential button clicked", () => {
    render(<CookieBanner />);
    const essentialBtn = screen.getByText("cookieEssential");
    fireEvent.click(essentialBtn);

    const raw = localStorage.getItem("alpar_cookie_consent") || "{}";
    const parsed = JSON.parse(raw);
    expect(parsed.consent.necessary).toBe(true);
    expect(parsed.consent.analytics).toBe(false);
    expect(parsed.consent.marketing).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("saves essential-only consent when escape key pressed", () => {
    render(<CookieBanner />);
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    const raw = localStorage.getItem("alpar_cookie_consent") || "{}";
    const parsed = JSON.parse(raw);
    expect(parsed.consent.necessary).toBe(true);
    expect(parsed.consent.analytics).toBe(false);
    expect(parsed.consent.marketing).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("shows granular consent checkboxes", () => {
    render(<CookieBanner />);
    expect(screen.getByText("cookieAnalytics")).toBeDefined();
    expect(screen.getByText("cookieMarketing")).toBeDefined();
    expect(screen.getByText("cookieNecessary")).toBeDefined();
  });
});
