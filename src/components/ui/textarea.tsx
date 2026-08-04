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
            {props.required && <span className="text-danger-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "bg-bg-secondary text-fg-primary min-h-[100px] w-full rounded-md border px-3 py-2 text-sm",
            "placeholder:text-fg-muted resize-y",
            "transition-colors duration-200",
            "focus:ring-brand-500 focus:ring-offset-bg-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-danger-500 focus:ring-danger-500"
              : "border-border-subtle focus:border-brand-500",
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
