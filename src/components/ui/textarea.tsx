import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
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
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "bg-bg-secondary/80 text-fg-primary min-h-[100px] w-full rounded-xl border px-3.5 py-2.5 text-sm backdrop-blur-sm",
            "placeholder:text-fg-muted/70 resize-y",
            "transition-all duration-200",
            "hover:border-border-strong",
            "focus-visible:border-brand-500 focus-visible:ring-brand-500/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:outline-none focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger-500 focus-visible:ring-danger-500/30 focus-visible:border-danger-500"
              : "border-border-subtle",
            className,
          )}
          {...props}
        />
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
Textarea.displayName = "Textarea";
