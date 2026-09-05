"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  direction?: "up" | "down";
}

export function ThemeToggle({ className, direction = "down" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-white/[0.04]",
          className,
        )}
      />
    );
  }

  const themeOptions = [
    {
      value: "light",
      label: tCommon("themeLight", { defaultValue: "Açık" }),
      icon: Sun,
    },
    {
      value: "dark",
      label: tCommon("themeDark", { defaultValue: "Koyu" }),
      icon: Moon,
    },
    {
      value: "system",
      label: tCommon("themeSystem", { defaultValue: "Sistem" }),
      icon: Monitor,
    },
  ] as const;

  // Render appropriate icon based on selected theme
  const CurrentIcon =
    theme === "system"
      ? Monitor
      : theme === "dark" || (!theme && resolvedTheme === "dark")
        ? Moon
        : Sun;

  return (
    <div className={cn("relative inline-flex items-center", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-fg-muted hover:text-fg-primary focus-visible:ring-brand-500 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-white/[0.04] transition-colors hover:border-border-strong hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
        aria-label={tCommon("toggleTheme", { defaultValue: "Temayı değiştir" })}
        aria-expanded={open}
        aria-haspopup="menu"
        title={tCommon("toggleTheme", { defaultValue: "Tema: Açık / Koyu / Sistem" })}
      >
        <CurrentIcon className="h-4 w-4 transition-transform active:scale-95" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "border-border-subtle bg-bg-elevated/95 absolute right-0 z-[120] min-w-[130px] overflow-hidden rounded-xl border p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                role="menuitem"
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left",
                  isSelected
                    ? "bg-brand-500/15 text-brand-300 font-semibold"
                    : "text-fg-secondary hover:bg-white/[0.08] hover:text-fg-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
