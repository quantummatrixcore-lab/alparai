import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const idFromProps = React.useId();
    const inputId = id ?? idFromProps;
    return (
      <div className={cn("flex gap-3", description ? "items-start" : "items-center")}>
        <div className="relative flex h-5 items-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : description ? `${inputId}-desc` : undefined
            }
            className={cn(
              "peer bg-bg-tertiary h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border transition-all duration-200",
              "checked:bg-brand-500 checked:border-brand-500",
              "focus:ring-brand-500 focus:ring-offset-bg-primary focus:ring-2 focus:ring-offset-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-danger-500" : "hover:border-brand-400/50 border-white/20",
              className,
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 text-white transition-transform duration-200 peer-checked:scale-100" />
        </div>
        {(label || description) && (
          <div className="flex-1 space-y-0.5 leading-snug">
            {label && (
              <label
                htmlFor={inputId}
                className="text-fg-primary block cursor-pointer text-sm font-medium select-none"
              >
                {label}
                {props.required && <span className="text-danger-500 ml-0.5">*</span>}
              </label>
            )}
            {description && (
              <p id={`${inputId}-desc`} className="text-fg-muted text-xs select-none">
                {description}
              </p>
            )}
            {error && (
              <p id={`${inputId}-error`} className="text-danger-500 text-xs" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
