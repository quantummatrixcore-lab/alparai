// @vitest-environment jsdom
import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { UserMenu } from "@/components/layout/user-menu";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "tr",
}));

vi.mock("@/actions/auth/auth", () => ({
  getMe: vi.fn().mockResolvedValue({ user: null }),
  performSignOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
});

describe("UserMenu Component", () => {
  test("renders sign in link when unauthenticated", () => {
    render(<UserMenu initialUser={null} />);
    expect(screen.getByRole("link", { name: "signIn" })).toBeDefined();
  });

  test("renders user avatar and dropdown menu when authenticated", () => {
    const mockUser = {
      id: "u-1",
      email: "quantum.matrix.core@gmail.com",
      fullName: "Ercument Erden",
      avatarUrl: null,
      role: "ceo" as const,
    };

    render(<UserMenu initialUser={mockUser} />);
    const button = screen.getByRole("button", { name: "account" });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(screen.getByText("Ercüment ERDEN")).toBeDefined();
    expect(screen.getByText("quantum.matrix.core@gmail.com")).toBeDefined();
    expect(screen.getByText("signOut")).toBeDefined();
  });

  test("submitting signout form calls signout API", async () => {
    const mockUser = {
      id: "u-1",
      email: "quantum.matrix.core@gmail.com",
      fullName: "Ercument Erden",
      avatarUrl: null,
      role: "ceo" as const,
    };

    render(<UserMenu initialUser={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: "account" }));

    const signOutBtn = screen.getByRole("menuitem", { name: /signOut/i });
    fireEvent.click(signOutBtn);

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/signout", expect.objectContaining({ method: "POST" }));
  });
});
