// @vitest-environment jsdom
import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const mockSetTheme = vi.fn();
let mockTheme = "system";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: "dark",
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, opts?: { defaultValue?: string }) => {
    const map: Record<string, string> = {
      themeLight: "Açık",
      themeDark: "Koyu",
      themeSystem: "Sistem",
      toggleTheme: "Temayı değiştir",
    };
    return map[key] || opts?.defaultValue || key;
  },
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mockTheme = "system";
});

describe("ThemeToggle Component", () => {
  test("renders trigger button with correct label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Temayı değiştir" });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
  });

  test("clicking trigger button opens dropdown with Açık, Koyu, and Sistem", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Temayı değiştir" });
    fireEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Açık/i })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Koyu/i })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Sistem/i })).toBeDefined();
  });

  test("selecting 'Açık' calls setTheme('light') and closes dropdown", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Temayı değiştir" });
    fireEvent.click(trigger);

    const lightOption = screen.getByRole("menuitem", { name: /Açık/i });
    fireEvent.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("selecting 'Koyu' calls setTheme('dark') and closes dropdown", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Temayı değiştir" });
    fireEvent.click(trigger);

    const darkOption = screen.getByRole("menuitem", { name: /Koyu/i });
    fireEvent.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("selecting 'Sistem' calls setTheme('system') and closes dropdown", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Temayı değiştir" });
    fireEvent.click(trigger);

    const systemOption = screen.getByRole("menuitem", { name: /Sistem/i });
    fireEvent.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith("system");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("pressing Escape closes open dropdown", () => {
    render(<ThemeToggle />);
    const trigger = screen.getByRole("button", { name: "Temayı değiştir" });
    fireEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeDefined();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
