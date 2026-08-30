"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, placeholder, id, ...props }, ref) => {
    const idFromProps = React.useId();
    const inputId = id ?? idFromProps;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-fg-primary block text-sm font-medium">
            {label}
            {props.required && (
              <span className="text-danger-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "bg-bg-secondary/80 text-fg-primary w-full rounded-xl border px-3.5 py-2.5 text-sm backdrop-blur-sm",
            "transition-all duration-200",
            "hover:border-border-strong",
            "focus-visible:border-brand-500 focus-visible:ring-brand-500/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:outline-none focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "appearance-none bg-right bg-no-repeat pr-10",
            "bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239CA3AF%22 stroke-width=%222%22%3e%3cpath d=%22M6 9l6 6 6-6%22/%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[position:right_0.75rem_center]",
            error
              ? "border-danger-500 focus-visible:ring-danger-500/30 focus-visible:border-danger-500"
              : "border-border-subtle",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-bg-secondary text-fg-muted">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-bg-secondary text-fg-primary"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${inputId}-error`} className="text-danger-500 text-xs" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-fg-muted text-xs">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
