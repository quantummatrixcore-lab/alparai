"use client";

import * as React from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ModelOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ModelAutocompleteProps {
  name: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string, isCustom: boolean) => void;
  options: ModelOption[];
  error?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

export function ModelAutocomplete({
  name,
  label,
  required,
  value,
  onChange,
  options,
  error,
  placeholder,
  hint,
  disabled,
}: ModelAutocompleteProps) {
  const t = useTranslations("incident");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [customMode, setCustomMode] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const triggerId = `${id}-trigger`;

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  React.useEffect(() => {
    if (!value) {
      setCustomMode(false);
      return;
    }
    const matched = options.some((o) => o.value === value);
    if (!matched) setCustomMode(true);
  }, [value, options]);

  const filtered = React.useMemo(() => {
    if (!query) return options.slice(0, 100);
    const q = query.toLowerCase().trim();
    return options
      .filter(
        (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 100);
  }, [query, options]);

  const showAddCustom =
    query.length >= 2 &&
    !filtered.some((o) => o.label.toLowerCase() === query.toLowerCase().trim());

  const displayValue = value;
  const displayLabel = customMode
    ? value
    : (options.find((o) => o.value === value)?.label ?? value);

  const handleSelect = (opt: ModelOption) => {
    setCustomMode(false);
    onChange(opt.value, false);
    setOpen(false);
    setQuery("");
  };

  const handleCustomSubmit = () => {
    const clean = query.trim();
    if (clean.length < 2) return;
    setCustomMode(true);
    onChange(clean, true);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setCustomMode(false);
    onChange("", false);
    setQuery("");
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={triggerId} className="text-fg-primary block text-sm font-medium">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          id={triggerId}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className={cn(
            "bg-bg-secondary text-fg-primary w-full rounded-md border px-3 py-2 text-left text-sm",
            "transition-colors duration-200",
            "focus:ring-brand-500 focus:ring-offset-bg-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "flex items-center justify-between gap-2",
            error ? "border-danger-500" : "border-border-subtle focus:border-brand-500",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {displayValue ? (
            <span className="flex items-center gap-2 truncate">
              {customMode && (
                <span className="bg-warning-500/20 text-warning-400 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                  Custom
                </span>
              )}
              <span className="text-fg-primary truncate font-medium">{displayLabel}</span>
            </span>
          ) : (
            <span className="text-fg-muted">{placeholder ?? t("select_model")}</span>
          )}
          <div className="flex items-center gap-1">
            {displayValue && !open && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }
                }}
                className="text-fg-muted hover:text-danger-400 cursor-pointer rounded p-0.5 transition-colors"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "text-fg-muted h-4 w-4 shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </button>

        <input type="hidden" name={name} value={value} />

        {open && (
          <div
            role="listbox"
            className="bg-bg-elevated border-border-strong absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-2xl"
          >
            <div className="border-border-subtle flex items-center gap-2 border-b px-3 py-2">
              <Search className="text-fg-muted h-4 w-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_model")}
                className="bg-bg-elevated text-fg-primary placeholder:text-fg-muted w-full text-sm focus:outline-none"
              />
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 && !showAddCustom && (
                <div className="text-fg-muted px-4 py-6 text-center text-sm">
                  {t("no_models_match")}
                </div>
              )}

              {filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value && !customMode}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "hover:bg-bg-tertiary flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    opt.value === value && !customMode && "bg-bg-tertiary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded",
                      opt.value === value && !customMode
                        ? "bg-brand-500 text-white"
                        : "border-border-strong border",
                    )}
                  >
                    {opt.value === value && !customMode && <Check className="h-3 w-3" />}
                  </span>
                  <span className="text-fg-primary flex-1 font-medium">{opt.label}</span>
                  {opt.hint && <span className="text-fg-muted text-xs">{opt.hint}</span>}
                </button>
              ))}

              {showAddCustom && (
                <>
                  {filtered.length > 0 && <div className="border-border-subtle my-1 border-t" />}
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="hover:bg-warning-500/10 text-warning-400 flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold"
                  >
                    <span className="bg-warning-500/20 text-warning-400 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold">
                      +
                    </span>
                    <span>{t("add_model_label", { name: query.trim() })}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-danger-500 text-xs" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-fg-muted text-xs">{hint}</p>}
    </div>
  );
}
