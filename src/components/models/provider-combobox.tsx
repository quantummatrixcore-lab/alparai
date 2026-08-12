"use client";

import * as React from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
  isNew?: boolean;
}

export interface ProviderComboboxProps {
  name: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string, customName?: string) => void;
  options: ComboboxOption[];
  error?: string;
  placeholder?: string;
  hint?: string;
}

export function ProviderCombobox({
  name,
  label,
  required,
  value,
  onChange,
  options,
  error,
  placeholder,
  hint,
}: ProviderComboboxProps) {
  const t = useTranslations("incident");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [customMode, setCustomMode] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const inputId = `${id}-search`;
  const hiddenId = `${id}-hidden`;

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
    if (value && !customMode) {
      const found = options.find((o) => o.value === value);
      if (!found) {
        setCustomMode(true);
        const opt = options.find((o) => o.value === value);
        if (opt?.isNew) setCustomValue(opt.label);
      }
    }
  }, [value, options, customMode]);

  const filtered = React.useMemo(() => {
    if (!query) return options.slice(0, 100);
    const q = query.toLowerCase().trim();
    return options
      .filter(
        (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 100);
  }, [query, options]);

  const showAddNew =
    query.length >= 2 &&
    !filtered.some((o) => o.label.toLowerCase() === query.toLowerCase().trim());

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (opt: ComboboxOption) => {
    if (opt.isNew) {
      setCustomMode(true);
      setCustomValue(opt.label);
      onChange(opt.value, opt.label);
    } else {
      setCustomMode(false);
      setCustomValue("");
      onChange(opt.value);
    }
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setCustomMode(false);
    setCustomValue("");
    onChange("");
    setQuery("");
  };

  const handleCustomSubmit = (name: string) => {
    const clean = name.trim();
    if (clean.length < 2) return;
    const newValue = `custom:${clean.toLowerCase().replace(/\s+/g, "-")}`;
    setCustomMode(true);
    setCustomValue(clean);
    onChange(newValue, clean);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-fg-primary block text-sm font-medium">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          id={inputId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={hiddenId}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "bg-bg-secondary text-fg-primary w-full rounded-md border px-3 py-2 text-left text-sm",
            "transition-colors duration-200",
            "focus:ring-brand-500 focus:ring-offset-bg-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "flex items-center justify-between gap-2",
            error ? "border-danger-500" : "border-border-subtle focus:border-brand-500",
          )}
        >
          {customMode && customValue ? (
            <span className="flex items-center gap-2">
              <span className="bg-warning-500/20 text-warning-400 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Custom
              </span>
              <span className="text-fg-primary font-medium">{customValue}</span>
            </span>
          ) : selectedOption ? (
            <span className="text-fg-primary font-medium">{selectedOption.label}</span>
          ) : (
            <span className="text-fg-muted">{placeholder ?? t("select_provider")}</span>
          )}
          <div className="flex items-center gap-1">
            {(value || customValue) && !open && (
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
              className={cn("text-fg-muted h-4 w-4 transition-transform", open && "rotate-180")}
            />
          </div>
        </button>

        <input type="hidden" name={name} value={value} />

        {open && (
          <div
            id={hiddenId}
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
                placeholder={t("search_provider")}
                className="bg-bg-elevated text-fg-primary placeholder:text-fg-muted w-full text-sm focus:outline-none"
              />
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 && !showAddNew && (
                <div className="text-fg-muted px-4 py-6 text-center text-sm">
                  {t("no_providers_match")}
                </div>
              )}

              {filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "hover:bg-bg-tertiary flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    opt.value === value && "bg-bg-tertiary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded",
                      opt.value === value
                        ? "bg-brand-500 text-white"
                        : "border-border-strong border",
                    )}
                  >
                    {opt.value === value && <Check className="h-3 w-3" />}
                  </span>
                  <span className="text-fg-primary flex-1 font-medium">{opt.label}</span>
                  {opt.hint && <span className="text-fg-muted text-xs">{opt.hint}</span>}
                </button>
              ))}

              {showAddNew && (
                <>
                  {filtered.length > 0 && <div className="border-border-subtle my-1 border-t" />}
                  <button
                    type="button"
                    onClick={() => handleCustomSubmit(query)}
                    className="hover:bg-warning-500/10 text-warning-400 flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>{t("add_provider_label", { name: query.trim() })}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {customMode && customValue && !open && (
        <p className="text-warning-400 text-xs">{t("custom_provider_notice")}</p>
      )}

      {error && (
        <p className="text-danger-500 text-xs" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="text-fg-muted text-xs">{hint}</p>}
    </div>
  );
}
