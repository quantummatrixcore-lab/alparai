"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, hint, error, leftIcon, rightIcon, id, ...props }, ref) => {
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
        <div className="relative">
          {leftIcon && (
            <div
              className="text-fg-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "bg-bg-secondary/80 text-fg-primary w-full rounded-xl border px-3.5 py-2.5 text-sm backdrop-blur-sm",
              "placeholder:text-fg-muted/70",
              "transition-all duration-200",
              "hover:border-border-strong",
              "focus-visible:border-brand-500 focus-visible:ring-brand-500/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:outline-none focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-danger-500 focus-visible:ring-danger-500/30 focus-visible:border-danger-500"
                : "border-border-subtle",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div
              className="text-fg-muted absolute top-1/2 right-3 -translate-y-1/2"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
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
Input.displayName = "Input";
