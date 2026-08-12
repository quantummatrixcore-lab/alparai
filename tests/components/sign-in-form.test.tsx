// @vitest-environment jsdom
import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

afterEach(() => {
  cleanup();
});


vi.mock("@/actions/auth", () => ({
  signInWithGoogle: vi.fn(),
  signInWithMagicLink: vi.fn(),
}));

const mockToast = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => mockToast(...args) } }));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignInForm", () => {
  test("renders Google sign-in button enabled by default with pre-checked consent at top", async () => {
    const { SignInForm } = await import("@/components/auth/sign-in-form");
    render(<SignInForm locale="en" />);
    const btn = screen.getByRole("button", { name: "signin_with_google" });
    expect(btn.hasAttribute("disabled")).toBe(false);
  });

  test("renders email magic link form", async () => {
    const { SignInForm } = await import("@/components/auth/sign-in-form");
    render(<SignInForm locale="en" />);
    expect(screen.getByLabelText("email_label")).toBeDefined();
  });

  test("unchecking consent checkbox disables google sign-in button", async () => {
    const { SignInForm } = await import("@/components/auth/sign-in-form");
    render(<SignInForm locale="en" />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    const btn = screen.getByRole("button", { name: "signin_with_google" });
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  test("renders terms and privacy links", async () => {
    const { SignInForm } = await import("@/components/auth/sign-in-form");
    render(<SignInForm locale="en" />);
    expect(screen.getByText("terms_service")).toBeDefined();
    expect(screen.getByText("terms_privacy")).toBeDefined();
  });
});
