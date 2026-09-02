"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-white/[0.04] ${className || ""}`}
      />
    );
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`text-fg-muted hover:text-fg-primary focus-visible:ring-brand-500 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-white/[0.04] transition-colors hover:border-border-strong hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:outline-none ${className || ""}`}
      aria-label={tCommon("toggleTheme", { defaultValue: "Toggle theme" })}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
